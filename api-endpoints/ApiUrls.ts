export const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://inventory-fastapi.justvy.in';

const signIn = `${baseUrl}/auth/login`;
const vendorUsers = `${baseUrl}/users/vendor-user`;
const vendors = `${baseUrl}/vendors`
const divisions = `${baseUrl}/divisions`;
const users = `${baseUrl}/users`;
const brands = `${baseUrl}/brands`;
const categories = `${baseUrl}/categories`;
const categoryGroups = `${baseUrl}/category-groups`;
const productStatus = `${baseUrl}/statuses`;
const productUnits = `${baseUrl}/product-units`;
const productTypes = `${baseUrl}/product-types`;
const products = `${baseUrl}/products`;
const UserPermission = `${baseUrl}/users/with-permission`;
const barcode = `${baseUrl}/products/barcode`;
const divisionsBulk = `${baseUrl}/divisions/bulk`;
const transferInventory = `${baseUrl}/inventory/transfer`;
const divisionInventoryBulk = `${baseUrl}/division-inventory/bulk`;
const trayProducts = `${baseUrl}/division-inventory/tray`
const productInventoryLogs=`${baseUrl}/product-inventory-logs`;
const productStockStats=`${baseUrl}/stats/product-stock-stats`;
const salesReport=`${baseUrl}/stats/sales-report`;
const divisionInventory=`${baseUrl}/division-inventory`;
const orders =`${baseUrl}/orders`
const statsCategoryLogReport=`${baseUrl}/stats/category-log-report`;
const hubDivisionInventory =`${baseUrl}/stats/hub-division-inventory-report`;
const sell=`${baseUrl}/division-inventory/sell`;
const rkVendorsHub = `${baseUrl}/rk-vendors/hub`




export default {
  signIn,
  vendorUsers,
  divisions,
  users,
  brands,
  categories,
  categoryGroups,
  vendors,
  productStatus,
  productUnits,
  productTypes,
  products,
  UserPermission,
  barcode,
  divisionsBulk,
  transferInventory,
  divisionInventoryBulk,
  trayProducts,
  productInventoryLogs,
  productStockStats,
  salesReport,
  divisionInventory,
  orders,
  statsCategoryLogReport,
  hubDivisionInventory,
  sell,
  rkVendorsHub,
};
