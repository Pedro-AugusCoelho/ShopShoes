import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  
  const [cart, setCart] = useState<Product[]>(() => {
    
    const storagedCart  =  localStorage.getItem('@RocketShoes:cart');
    
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });
  const addProduct = async (productId: number) => {
    try {
    
    const stock = await api.get(`/stock/${productId}`);
    
    const tempProducts:Product[] = [...cart];
    const ProductExists = tempProducts.find(item => item.id === productId);
    
    const CurrentStocks = stock.data.amount;
    const CurrentAmount = ProductExists ? ProductExists.amount : 0;
    const amount = CurrentAmount + 1;

    if(amount > CurrentStocks){
      toast.error('Quantidade solicitada fora de estoque');
    }

    if(ProductExists){
      ProductExists.amount = amount;
    }else{
      const products = await api.get(`/products/${productId}`);
      const newProduct = {...products.data , amount:1};
      tempProducts.push(newProduct);
    }
    toast.success('Adicionado ao carrinho');
    setCart(tempProducts);
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(tempProducts));
    }catch{
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const tempProducts:Product[] = [...cart];
      const ProductExists = tempProducts.find(item => item.id === productId);
      
      if(!ProductExists){
        return toast.error('Erro na remoção do produto');
      }
      
      const index = cart.filter(item => item.id !== productId);
      setCart(index);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(index));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const tempProducts:Product[] = [...cart];
      const stock = await api.get(`/stock/${productId}`);
      const ProductExists = tempProducts.find(item => item.id === productId);
      
      if(amount > stock.data.amount){
        return toast.error('Quantidade solicitada fora de estoque');
      };
      
      if(amount < 1){
        return toast.error('Quantidade não pode ser menor que 1');
      };

      if(!ProductExists){
        return toast.error('Produto não existe');
      };
        for(let i in tempProducts){
          if(tempProducts[i].id === productId){
              if(amount <= stock.data.amount){
                tempProducts[i].amount = amount;
              }
          }
        }
        setCart(tempProducts);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(tempProducts));
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);
  return context;
}
