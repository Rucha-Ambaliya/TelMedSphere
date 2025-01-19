import React, { useContext, useState, useEffect } from "react";
import useDocTitle from "../hooks/useDocTitle";
import cartContext from "../contexts/cart/cartContext";
import CartItem from "../components/cart/CartItem";
import EmptyView from "../components/cart/EmptyView";
import { Alert, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import httpClient from "../httpClient";
import Preloader from "../components/common/Preloader";
import commonContext from "../contexts/common/commonContext";
import useScrollDisable from "../hooks/useScrollDisable";

const Cart = () => {
  const { isLoading, toggleLoading } = useContext(commonContext);

  useDocTitle("Cart");

  const navigate = useNavigate();
  const userNotExists =
    localStorage.getItem("usertype") === undefined ||
    localStorage.getItem("usertype") === null;
  const [cart, setCart] = useState([]);
  const { cartItems, clearCart, placeOrder, setCartItems } =
    useContext(cartContext);

  useEffect(() => {
    if (userNotExists) {
      navigate("/");
    } else {
      toggleLoading(true);
      if (cart !== cartItems) {
        httpClient
          .post("add_to_cart", {
            email: localStorage.getItem("email"),
            cart: cartItems,
          })
          .then((res) => {
            setCartItems(res.data.cart);
            setCart(res.data.cart);
            toggleLoading(false);
          })
          .catch((err) => {
            console.log(err);
            toggleLoading(false);
          });
      }
    }
    //eslint-disable-next-line
  }, []);

  useScrollDisable(isLoading);

  const cartQuantity = cartItems.length;

  // total original price
  const [cartTotal, setCartTotal] = useState(0);

  // Set this to user's balance amount
  const [balance, setBalance] = useState(0);
  const [addBalance, setAddBalance] = useState(false);
  const [totalBalance, setTotalBalance] = useState(cartTotal);

  useEffect(() => {
    setCartTotal(0);
    setTotalBalance(0);
    cartItems.forEach((item) => {
      setCartTotal((prev) => prev + item.price * item.quantity);
      setTotalBalance((prev) => prev + item.price * item.quantity);
    });
    // console.log(cartItems);
    httpClient
      .post("/get_wallet", { email: localStorage.getItem("email") })
      .then((res) => {
        setBalance(Number(res.data.wallet));
      });
  }, [cartItems]);

  // setTotalBalance(cartTotal);

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isAlert, setIsAlert] = useState(0);

  const deleteAll = () => {
    httpClient.post("delete_all_cart", {
      email: localStorage.getItem("email"),
    });
  };

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <>
      <section id="" className="text-blue-8 py-32 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-3 ">
          {cartQuantity === 0 ? (
            <EmptyView
              msg="Your Cart is Empty"
              link="/all-medicines"
              btnText="Start Shopping"
            />
          ) : (
            <div className="grid grid-cols-7 items-start max-lg:grid-cols-1 overflow-x-hidden overflow-y-auto gap-8">
              <div className="col-span-4 max-h-[600px] py-6 max-lg:px-6 sm:p-4 max-lg:col-span-full">
                {cartItems.map((item) => (
                  <CartItem key={item.id} {...item} />
                ))}
              </div>

              <div className="col-span-3 max-lg:col-span-full">
                <div className="text-right">
                  <button
                    onClick={() => {
                      clearCart();
                      deleteAll();
                    }}
                   className="bg-red-700 text-white-1 px-4 py-4 m-1 rounded-[8px] cursor-pointer shadow-[0_0_10px_1px_rgba(255,_0,_0,_0.4)] hover:bg-social-google">
                    Clear Cart
                  </button>
                </div>
                <div className="my-5">
                  <h3>
                    Order Summary &nbsp; ( {cartQuantity}{" "}
                    {cartQuantity > 1 ? "items" : "item"} )
                  </h3>
                  <div className=" mt-[3rem] mb-7">
                    <div className="text-[1.6rem] flex justify-between items-center text-blue-7">
                      <b>
                        <small>SUBTOTAL</small>
                      </b>
                      <b>₹ {totalBalance} /-</b>
                    </div>
                    <div className="flex justify-between items-center my-4 border-t-[1px] border-grey-2"></div>
                    <div className="bg-black-1 bg-opacity-5 text-black-2 p-6 rounded-[12px] flex justify-between items-center">
                      The subtotal reflects the total price of your order,
                      including duties and taxes, before any applicable
                      discounts. It does not include delivery costs and
                      international transaction fees.
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      console.log(cartTotal);
                      if (!addBalance) {
                        if (cartTotal <= balance) {
                          setTotalBalance(0);
                        } else {
                          setTotalBalance(cartTotal - balance);
                        }
                      } else {
                        setTotalBalance(cartTotal);
                      }
                      setAddBalance((prev) => !prev);
                    }}
                    className="flex justify-start items-center cursor-pointer mb-6"
                  >
                    <input
                      type="checkbox mr-4"
                      checked={addBalance}
                      onChange={() => {}}
                    />
                    <p>Use Wallet Money {`(₹ ${balance})`}</p>
                  </div>

                  <button
                    type="button"
                    method="post"
                    className={`inline-block bg-blue-9 text-blue-1 px-7 py-3 transition-colors duration-300 ease-in-out hover:bg-blue-7 w-full active:bg-blue-7 ${
                      isCheckoutLoading && "active"
                    }`}
                    onClick={() => {
                      if (totalBalance === 0) {
                        httpClient.post("/debit_wallet", {
                          email: localStorage.getItem("email"),
                          walletAmount: cartTotal,
                        });
                        localStorage.setItem("totalPrice", cartTotal);
                        // cartItems.forEach((item) => {
                        //   placeOrder(item);
                        // });
                        localStorage.setItem(
                          "orders",
                          JSON.stringify(cartItems)
                        );
                        window.location.href =
                          "https://telmedsphere-server.vercel.app/success";
                      } else {
                        setIsCheckoutLoading(true);
                        httpClient.post("/debit_wallet", {
                          email: localStorage.getItem("email"),
                          walletAmount: balance,
                        });
                        setTimeout(() => {
                          localStorage.setItem("totalPrice", cartTotal);
                          cartItems.forEach((item) => {
                            placeOrder(item);
                          });
                          navigate("/checkout");
                          setIsCheckoutLoading(false);
                          setIsAlert(2);
                        }, 2000);
                      }
                    }}
                  >
                    {isCheckoutLoading ? (
                      <CircularProgress size={24} sx={{ color: "#f5f5f5" }} />
                    ) : (
                      "Checkout"
                    )}
                  </button>

                  {isAlert !== 0 &&
                    (isAlert === 1 ? (
                      <Alert severity="error">
                        Error in ordering medicines
                      </Alert>
                    ) : (
                      <Alert severity="success">Order Successful</Alert>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Cart;
