import React, { useContext } from 'react';
import { TbTrash } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import cartContext from '../../contexts/cart/cartContext';
import QuantityBox from './QuantityBox';
import httpClient from '../../httpClient';


const CartItem = (props) => {

    const { id, images, title, price, quantity } = props;

    const { removeItem } = useContext(cartContext);

    const remove = (id) => {
        httpClient.post('/delete_cart', {email: localStorage.getItem("email"), id: id})
    }

    return (
        <>
            <div className="cart_item bg-blue grid grid-cols-7 rounded-[12px] max-md:gap-8 mb-6">
                <figure className="col-span-2 max-sm:col-span-3">
                    <Link to={`/all-medicines/medicine-details/${id}`}>
                        <img src={images[0]} alt="product-img" className='rounded-[12px] max-w-[150px] max-h-[150px] w-full'/>
                    </Link>
                </figure>
                <div className="col-span-5 relative max-sm:col-span-4">
                    <div className="flex justify-between items-start">
                        <h4 className="text-base font-medium sm:text-sm">
                            <Link to={`/all-medicines/medicine-details/${id}`} className=' max-sm:text-sm'><span className='text-2xl mb-4 font-bold max-sm:text-base'>{title}</span> <br />Pharmaceuticals</Link>
                        </h4>
                        <div className="text-xl group relative">
                            <span onClick={() => {removeItem(id); remove(id)}} className='cursor-pointer hover:text-social-google absolute right-10 max-sm:right-4'>
                                <TbTrash />
                            </span>
                            <div className="w-auto opacity-0 invisible group-hover:opacity-100 group-hover:visible bg-blue-6 text-white-1 rounded-[3px] text-xs px-2 py-1 border-[1px] border-grey-3 mt-12 sm:left-0">Remove Item</div>
                        </div>
                    </div>

                    <h2 className="text-xl text-blue-7 sm:text-base">
                        ₹ {price} /-&nbsp;
                    </h2>

                    <QuantityBox itemId={id} itemQuantity={quantity} />
                </div>
            </div>
        </>
    );
};

export default CartItem;