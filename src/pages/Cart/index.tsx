import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(product => ({
    ...product,
    priceFormatted: formatPrice(product.price),
    subTotal:formatPrice(product.amount * product.price)
  }));
  
  const total = formatPrice(cart.reduce((sumTotal, product) => {
    return sumTotal + product.amount * product.price;
    }, 0)
  );

  function handleProductIncrement(product: Product) {
    let productId = product.id;
    let amount = product.amount + 1;
    updateProductAmount({ productId, amount });
  }

  function handleProductDecrement(product: Product) {
    let productId = product.id;
    let amount = product.amount - 1;
    updateProductAmount({ productId, amount });
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        
        {cartFormatted.map((val) => (
          <tbody key={val.id}>
            <tr data-testid="product">
              <td>
                <img src={val.image} alt={val.title} />
              </td>
              <td>
                <strong>{val.title}</strong>
                <span>{val.priceFormatted}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                    disabled={val.amount <= 1}
                    onClick={() => handleProductDecrement(val)}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={val.amount}
                  />
                  
                  <button
                    type="button"
                    data-testid="increment-product"
                    onClick={() => handleProductIncrement(val)}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{val.subTotal}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                  onClick={() => handleRemoveProduct(val.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          </tbody>
        )) 
        }
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
