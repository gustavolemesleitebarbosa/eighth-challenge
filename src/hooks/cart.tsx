import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity?: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const fechtedProducts = await AsyncStorage.getItem('@GoMarketplace:cart');
      if (fechtedProducts) {
        setProducts(JSON.parse(fechtedProducts));
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const index = products.findIndex(item => item.id === product.id);
      if (index !== -1) {
        const updatedProducts = [...products];
        if (products[index].quantity !== undefined) {
          const quantity = products[index].quantity + 1;
          updatedProducts[index] = { ...product, quantity };
          setProducts(updatedProducts);
          try {
            await AsyncStorage.setItem(
              '@GoMarketPlace:cart',
              JSON.stringify(updatedProducts),
            );
          } catch (error) {
            console.log('now there is a fucking error', error);
          }
        }
        return;
      }
      const productWithQuantity = { ...product, quantity: 1 };
      setProducts([...products, productWithQuantity]);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify([...products, productWithQuantity]),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      let updatedProducts;
      const index = products.findIndex(product => product.id === id);
      if (index !== -1) {
        updatedProducts = [...products];
        updatedProducts[index].quantity += 1;
        setProducts(updatedProducts);
      }
      try {
        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(updatedProducts),
        );
      } catch (error) {
        console.log('there is a fucking error', error);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      let updatedProducts;
      const index = products.findIndex(product => product.id === id);
      if (index !== -1) {
        const currentQuantity = products[index].quantity;
        if (currentQuantity === 1) {
          const updatedArray = products.filter(product => product.id !== id);
          setProducts(updatedArray);
        }
        updatedProducts = [...products];
        updatedProducts[index].quantity -= 1;
        setProducts(updatedProducts);
      }
      try {
        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(updatedProducts),
        );
      } catch (error) {
        console.log('there is a fucking error', error);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
