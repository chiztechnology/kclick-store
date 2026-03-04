import { storePortalApiService } from '../../../lib/api';
import type { Store, StoreProduct, StockMovement, Order, Product } from '../../../types';

export interface StoreStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  averageRating: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export async function getStoreById(storeId: string): Promise<Store | null> {
  const res = await storePortalApiService.getStoreById(storeId);
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export async function getStoresForManager(): Promise<Store[]> {
  const res = await storePortalApiService.getStoresForManager();
  if (res.error) throw new Error(res.error.message);
  return res.data || [];
}

export async function getStoreStats(storeId: string): Promise<StoreStats> {
  const res = await storePortalApiService.getStoreStats(storeId);
  if (res.error) throw new Error(res.error.message);
  return res.data || {
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    averageRating: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
  };
}

export async function getStoreProducts(storeId: string): Promise<StoreProduct[]> {
  const res = await storePortalApiService.getStoreProducts(storeId);
  if (res.error) throw new Error(res.error.message);
  return res.data || [];
}

export async function getAvailableProducts(storeId: string): Promise<Product[]> {
  const res = await storePortalApiService.getAvailableProducts(storeId);
  if (res.error) throw new Error(res.error.message);
  return res.data || [];
}

export async function addProductToStore(storeId: string, productId: string, data: Partial<StoreProduct>): Promise<StoreProduct> {
  const res = await storePortalApiService.addProductToStore(storeId, productId, data);
  if (res.error) throw new Error(res.error.message);
  return res.data as StoreProduct;
}

export async function updateStoreProduct(id: string, data: Partial<StoreProduct>): Promise<StoreProduct> {
  const res = await storePortalApiService.updateStoreProduct(id, data);
  if (res.error) throw new Error(res.error.message);
  return res.data as StoreProduct;
}

export async function removeProductFromStore(id: string): Promise<void> {
  const res = await storePortalApiService.removeProductFromStore(id);
  if (res.error) throw new Error(res.error.message);
}

export async function updateStock(
  storeProductId: string,
  quantity: number,
  movementType: StockMovement['movement_type'],
  notes?: string
): Promise<void> {
  const res = await storePortalApiService.updateStock(storeProductId, quantity, movementType, notes);
  if (res.error) throw new Error(res.error.message);
}

export async function getStockMovements(storeId: string, limit = 50): Promise<StockMovement[]> {
  const res = await storePortalApiService.getStockMovements(storeId, limit);
  if (res.error) throw new Error(res.error.message);
  return res.data || [];
}

export async function getStoreOrders(storeId: string): Promise<Order[]> {
  const res = await storePortalApiService.getStoreOrders(storeId);
  if (res.error) throw new Error(res.error.message);
  return res.data || [];
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const res = await storePortalApiService.updateOrderStatus(orderId, status);
  if (res.error) throw new Error(res.error.message);
}

export async function getLowStockProducts(storeId: string): Promise<StoreProduct[]> {
  const res = await storePortalApiService.getLowStockProducts(storeId);
  if (res.error) throw new Error(res.error.message);
  return res.data || [];
}
