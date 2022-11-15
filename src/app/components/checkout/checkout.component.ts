import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { BabyshopFormService } from 'src/app/services/babyshop-form.service';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { BabyshopValidator } from 'src/app/validators/babyshop-validator';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup
  totalPrice: number = 0
  totalQuantity: number = 0

  creditCardYears: number[] = []
  creditCardMonths: number[] = []


  constructor(private formBuilder: FormBuilder, 
              private babyshopFormService: BabyshopFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {

    this.reviewCartDetails()


    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        name: new FormControl ('', [Validators.required, Validators.minLength(2), BabyshopValidator.notOnlyWhitespace]),
        contact: new FormControl ('', [ Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(8), Validators.maxLength(11)] ),
        email: new FormControl ('', [ Validators.email, Validators.required, Validators.minLength(2)] )
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl ('', [Validators.required, Validators.minLength(2)]),
        city: new FormControl ('', [Validators.required, Validators.minLength(2)]),
        postalCode: new FormControl ('', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern("^[0-9]*$")]),
        country: new FormControl ('', [Validators.required, Validators.minLength(2)]),
        state: new FormControl ('', [Validators.required, Validators.minLength(2)])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl ('', [Validators.required, Validators.minLength(2)]),
        city: new FormControl ('', [Validators.required, Validators.minLength(2)]),
        postalCode: new FormControl ('', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern("^[0-9]*$")]),
        country: new FormControl ('', [Validators.required, Validators.minLength(2)]),
        state: new FormControl ('', [Validators.required, Validators.minLength(2)])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl ('', [Validators.required]),
        nameOnCard: new FormControl ('', [Validators.required, Validators.minLength(2), BabyshopValidator.notOnlyWhitespace]),
        cardNumber: new FormControl ('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl ('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expiryMonth: new FormControl (''),
        expiryYear: new FormControl (''),
      })

    })


    const startMonth: number = new Date().getMonth() + 1

    this.babyshopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data
      }
    )

    this.babyshopFormService.getCreditCardYears().subscribe(
      data => {
        this.creditCardYears = data
      }
    )

  }

  reviewCartDetails() {
    
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    )  

    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    )  
  }


  get name() { return this.checkoutFormGroup.get('customer.name') }
  get email() { return this.checkoutFormGroup.get('customer.email') }
  get contact() { return this.checkoutFormGroup.get('customer.contact') }

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressPostalCode() { return this.checkoutFormGroup.get('shippingAddress.postalCode'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressPostalCode() { return this.checkoutFormGroup.get('billingAddress.postalCode'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }


 
  onSubmit() {
    console.log("Handling the submit button");

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order
    this.totalQuantity = order.totalQuantity
    this.totalPrice = order.totalPrice

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    // - long way
    
    let orderItems: OrderItem[] = [];
    for (let i=0; i < cartItems.length; i++) {
      orderItems[i] = new OrderItem(cartItems[i]);
    }
    

    // - short way of doing the same thingy
    // let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem.imageUrl!, tempCartItem.unitPrice!, tempCartItem.quantity, tempCartItem.id!));

    // set up purchase
    let purchase = new Purchase();
    
    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
    
    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;
  
    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItem = orderItems;

    // call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
        next: response => {
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

          // reset cart
          this.resetCart();

        },
        error: err => {
          alert(`We have received your order`);

          this.resetCart();
        }
      }
    );

  }

  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    
    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard')

    const currentYear: number =new Date().getFullYear()
    const selectedYear: number = Number(creditCardFormGroup?.value.expiryYear)

    let startMonth: number 

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() +1
    } else {
      startMonth = 1
    }

    this.babyshopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data
      }
    )
  }

}
