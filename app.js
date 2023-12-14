
const client = contentful.createClient({
  space: "nqjt8tknc9j5",
  accessToken: "7miJ_o3-4kIuyAS0c72PemN-_zQrkNAuezkhpvlVx-Y"
});
console.log(client);

const cartbtn= document.querySelector('.cart-btn')
const closecart= document.querySelector('.close')
const ClearCartbtn= document.querySelector(".remove-item")
const cartContent= document.querySelector('.cart-content')
const cartDisplay= document.querySelector(".cart-window")
const cartviewDOM= document.querySelector('.cart-view')
const clearCartbtn= document.querySelector('.clear-cart')
const cartItem= document.querySelector('.cart-item')
const cartTotal= document.querySelector('.cart-total')
const productsDOM= document.querySelector('.product-display')
const DomCategories= document.querySelector('.categories')
const Dombanner=document.querySelector('.banner');

let cart=[];
let Allbuttons= [];

class Products{
    async getProducts(){
        try{
            let productconnect= await client.getEntries({
                content_type: "yourOnlineWardrode"
            });
            
                
            //let result= await fetch("products.json");
            //let data= await result.json();

            let products= productconnect.items;
            products= products.map(item=>{
                const {title,price}= item.fields;
                const {category}=item.fields;
                const {id}= item.sys;
                const image= item.fields.image.fields.file.url;
                return {title,category,price,id,image};
            })
            return products;
        }catch(error){
            console.log(error);
        }
    }
}

class UI{
    
    filterDom(products){
        
        for(let i of products){
            let div= document.createElement("div");
            div.classList.add("product",i.category);
            div.innerHTML=`
                <div class="image-container">
                    <img src=${i.image}
                    class="prod-image">
                    <button class="prod-btn" data-id=${i.id}>Buy Now</button>
                </div>
                <h4 >${i.title}</h4>
                <h5 >$${i.price}</h5>`
            
            
            productsDOM.appendChild(div)

        }
        
        
    }
    DomScroll(){
        Dombanner.addEventListener('click',()=>{
            location.href="#product-section";
        })
    }
    
    
    
    getProductbtn(){
        const buttons= [...document.querySelectorAll(".prod-btn")];
        Allbuttons=buttons;
        buttons.forEach(button =>{
            let id= button.dataset.id;
            let incart= cart.find(item=> item.id === id);
            if(incart){
                button.innerHTML="In Cart";
                button.disabled= true
            };
                
            button.addEventListener("click",event => {
                event.target.innerText="In cart";
                event.target.disabled=true;
                let cartitem={...storage.getProduct(id),
                amount:1};
                cart=[...cart,cartitem];
                console.log(cart);
                
                storage.AddedCart(cart);
                this.setCartNumbers(cart);
                this.AddToCart(cartitem);
                this.DisplayCart();
            });


        });
    };
    setCartNumbers(cart){
        let Totalamount= 0;
        let TotalItem= 0;
        cart.map(item => {
            Totalamount += item.price * item.amount;
            TotalItem += item.amount;
        });
        cartTotal.innerText=parseFloat(Totalamount.toFixed(2));
        cartItem.innerText= TotalItem;

    }
    AddToCart(item){
        const div= document.createElement('div')
        div.classList.add('cart-A-items');
        div.innerHTML=`<img src=${item.image}
                 alt="product"/>
                <div>
                    <h4>${item.title}</h4>
                    <h5>$${item.price}</h5>
                    <span class="remove-item" data-id=
                    ${item.id}>remove</span>
                </div>
                <div>
                    <i class="bi bi-chevron-up" data-id=${item.id}></i>
                    <p class="item-count">${item.amount}</p>
                    <i class="bi bi-chevron-down" data-id=${item.id}></i>
                </div>`;
        cartContent.appendChild(div);
        
        
    }
    DisplayCart(){
        cartDisplay.classList.add('showcart');
        cartviewDOM.classList.add('Display');

    }
    SetupApp(){
        cart= storage.getCart();
        this.setCartNumbers(cart);
        this.loadCart(cart);
        cartbtn.addEventListener('click',this.DisplayCart)
        closecart.addEventListener('click',this.hideCart);
        

    }
    loadCart(){
        cart.forEach(item => this.AddToCart(item));
    }
    hideCart(){
        cartDisplay.classList.remove('showcart');
        cartviewDOM.classList.remove('Display');
    }
    cartFunctions(){
        clearCartbtn.addEventListener("click",()=>{
            this.clearcart();
        });
        cartContent.addEventListener("click",event => {
            if(event.target.classList.contains("remove-item")){
                let removeItem= event.target;
                let id= removeItem.dataset.id;
                console.log(id);
                cartContent.removeChild(removeItem.parentElement.parentElement);

                this.removeItem(id);

            }    
            
        })
        cartContent.addEventListener("click",event=>{
            if(event.target.classList.contains("bi-chevron-up")){
                let addamount= event.target;
                let id= addamount.dataset.id;
                
                let temCart= cart.find(item => item.id === id);
                temCart.amount= temCart.amount + 1;
                storage.AddedCart(cart);
                this.setCartNumbers(cart);
                addamount.nextElementSibling.innerText= temCart.amount;
            }else if(event.target.classList.contains("bi-chevron-down")){
                let loweramount= event.target;
                let id= loweramount.dataset.id;

                let temCart= cart.find(item => item.id === id);
                temCart.amount= temCart.amount - 1;
                if(temCart.amount>0){
                    storage.AddedCart(cart);
                    this.setCartNumbers(cart);
                    loweramount.previousElementSibling.innerText= temCart.amount;
                }else{
                    cartContent.removeChild(loweramount.parentElement.parentElement);
                    this.removeItem(id);
                }

            }
        });


    }
    
    clearcart(){
        let cartItem= cart.map(item => item.id);
        console.log(cartItem);
        cartItem.forEach( id => this.removeItem(id));

        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }
    removeItem(id){
        cart= cart.filter(item => item.id !== id);
        this.setCartNumbers(cart);
        storage.AddedCart(cart);
        let button= this.getSingleButton(id);
        button.disabled=false;
        button.innerHTML=`Add to cart`;
    }
    getSingleButton(id){
        return Allbuttons.find(button => button.dataset.id === id);
    }
}

class storage{
    static storeProducts(products){
        localStorage.setItem("products", JSON.stringify(products));
    };
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    };

    static AddedCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem("cart")?JSON.parse
        (localStorage.getItem("cart")):[]

    }
}
function filterprod(value){
        
    let buttons = document.querySelectorAll(".btn-value");
    buttons.forEach(button=>{
        if(value.toUpperCase() == button.innerText.toUpperCase()){
            console.log(value);
            console.log(button);
            
            button.style.background="black";
            button.style.color="white";
            

        }
        else{
            button.style.background="transparent";
            button.style.color="black";
        }     
    });
    let displayItem= document.querySelectorAll(".product");
    displayItem.forEach(item =>{
        if(value == "All-products"){
            item.classList.remove("hide");
        }
        else{
            if(item.classList.contains(value)){
                item.classList.remove("hide");

            }
            else{
                item.classList.add("hide");
            }
        }
    })

}

document.addEventListener("DOMContentLoaded",()=>{
    const ui=  new UI() ;
    const productss= new Products();
    filterprod('All-products');
    

    ui.SetupApp();

    productss.getProducts().then(products=>{
        ui.filterDom(products);
        ui.DomScroll();
        storage.storeProducts(products);
        
    })
    .then(()=>{
        ui.getProductbtn();
        ui.cartFunctions();
    });
});