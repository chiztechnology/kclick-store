import { apiClient } from '../../../lib/api/apiClient';
import type { StorePayout, StorePromotion, Voucher, Campaign } from '../../../types';

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await apiClient.patch(`/orders/${orderId}`, { status });
  if (error) throw new Error(error.message);
}

export async function updateOrderTracking(orderId: string, trackingNumber: string) {
  const { error } = await apiClient.patch(`/orders/${orderId}`, { tracking_number: trackingNumber });
  if (error) throw new Error(error.message);
}

export async function getStockMovements(storeId: string) {
  const { data, error } = await apiClient.get<any[]>(
    `/stock-movements?store_id=${storeId}&limit=50&order_by=created_at&order_dir=desc`
  );
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createStockMovement(movement: {
  product_id: string;
  store_id: string;
  movement_type: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  notes?: string;
  created_by: string;
}) {
  const { error } = await apiClient.post('/stock-movements', movement);
  if (error) throw new Error(error.message);
}

export async function updateProductStock(productId: string, newStock: number) {
  const { error } = await apiClient.patch(`/products/${productId}`, { stock: newStock });
  if (error) throw new Error(error.message);
}

export async function getStorePayouts(storeId: string): Promise<StorePayout[]> {
  const { data, error } = await apiClient.get<StorePayout[]>(
    `/store-payouts?store_id=${storeId}&order_by=created_at&order_dir=desc`
  );
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getStorePromotions(storeId: string): Promise<StorePromotion[]> {
  const { data, error } = await apiClient.get<StorePromotion[]>(
    `/store-promotions?store_id=${storeId}&include=product&order_by=created_at&order_dir=desc`
  );
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createStorePromotion(promo: Partial<StorePromotion>) {
  const { error } = await apiClient.post('/store-promotions', promo);
  if (error) throw new Error(error.message);
}

export async function deleteStorePromotion(id: string) {
  const { error } = await apiClient.delete(`/store-promotions/${id}`);
  if (error) throw new Error(error.message);
}

export async function getStoreVouchers(storeId: string): Promise<Voucher[]> {
  const { data, error } = await apiClient.get<Voucher[]>(
    `/vouchers?store_id=${storeId}&order_by=created_at&order_dir=desc`
  );
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createStoreVoucher(voucher: Partial<Voucher>) {
  const { error } = await apiClient.post('/vouchers', voucher);
  if (error) throw new Error(error.message);
}

export async function deleteStoreVoucher(id: string) {
  const { error } = await apiClient.delete(`/vouchers/${id}`);
  if (error) throw new Error(error.message);
}

export async function getActiveCampaigns(): Promise<Campaign[]> {
  const { data, error } = await apiClient.get<Campaign[]>(
    `/campaigns?is_active=true&order_by=starts_at&order_dir=desc`
  );
  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateStoreProfile(storeId: string, updates: Record<string, unknown>) {
  const { error } = await apiClient.patch(`/stores/${storeId}`, updates);
  if (error) throw new Error(error.message);
}

export async function uploadStoreImage(file: File): Promise<string> {
  const { data, error } = await apiClient.upload('/uploads', file, { context: 'store' });
  if (error) throw new Error(error.message);
  return data!.url;
}

export async function getProductViewsCount(storeId: string, days = 30): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await apiClient.get<{ count: number }>(
    `/product-views/count?store_id=${storeId}&since=${since.toISOString()}`
  );
  if (error) return 0;
  return data?.count || 0;
}

export async function getDailySales(storeId: string, days = 10) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await apiClient.get<{ total: number; created_at: string }[]>(
    `/orders?store_id=${storeId}&since=${since.toISOString()}&exclude_status=cancelled,refunded&fields=total,created_at`
  );
  if (error) return [];
  return data || [];
}

export async function getRepeatCustomers(storeId: string): Promise<number> {
  const { data, error } = await apiClient.get<{ count: number }>(
    `/orders/repeat-customers?store_id=${storeId}`
  );
  if (error) return 0;
  return data?.count || 0;
}
