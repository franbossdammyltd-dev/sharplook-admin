import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { HttpClient } from "../../../api/HttpClient";
import { useToast } from "../../components/useToast";
import { ScaleLoader } from "react-spinners";
import { HexConverter } from "../../components/HexConverter";
import { AxiosError } from "axios";
// import ProductDetail from './ProductDetail';

// Define types based on API response
interface Product {
  id: string;
  vendorId: string;
  productName: string;
  description: string;
  price: number;
  qtyAvailable: number;
  unitsSold: number;
  status: string;
  picture: string;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    vendorOnboarding?: {
      businessName: string;
    };
  };
}

interface ApiResponse {
  success: boolean;
  data: {
    PENDING?: Product[];
    APPROVED?: Product[];
    REJECTED?: Product[];
  };
}

const Product = () => {
  const [tab, setTab] = useState("listings");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await HttpClient.get("/admin/products");
          console.log("babababa", response)

        if (response.data.success) {
          const responseData = response.data.data as ApiResponse["data"];

          // Combine all products from different approval statuses
          let allProducts: Product[] = [];


          if (responseData.PENDING) {
            allProducts = [...allProducts, ...responseData.PENDING];
          }
          if (responseData.APPROVED) {
            allProducts = [...allProducts, ...responseData.APPROVED];
          }
          if (responseData.REJECTED) {
            allProducts = [...allProducts, ...responseData.REJECTED];
          }

          setProducts(allProducts);
        } else {
          setError("Failed to fetch products");
          showToast("Failed to fetch products", { type: "error" });
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch products";
        setError(errorMessage);
        // Don't show toast for 403 status code
        if (err instanceof AxiosError && err.response?.status === 403) {
          // Skip showing toast for 403
        } else {
          showToast(errorMessage, { type: "error" });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [showToast]);

  // Filtered products based on search and tab
  const filterProducts = (products: Product[]) => {
    // Ensure products is an array before filtering
    if (!Array.isArray(products)) {
      return [];
    }

    let filtered = products.filter(
      (product) =>
        product.productName.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.id.toLowerCase().includes(search.toLowerCase())
    );

    // Filter by approval status based on current tab
    if (tab === "approval") {
      filtered = filtered.filter(
        (product) =>
          product.approvalStatus === "PENDING" ||
          product.approvalStatus === "APPROVED" ||
          product.approvalStatus === "REJECTED"
      );
    }
    // For listings tab, show all products regardless of approval status

    return filtered;
  };

  // Pagination logic
  const getPaginatedProducts = (products: Product[]) => {
    // Ensure products is an array before slicing
    if (!Array.isArray(products)) {
      return [];
    }
    const start = (page - 1) * rowsPerPage;
    return products.slice(start, start + rowsPerPage);
  };

  // Reset to first page when search or tab changes
  useEffect(() => {
    setPage(1);
  }, [search, tab]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const filtered = filterProducts(products);
    const totalPages = Math.ceil(filtered.length / rowsPerPage);
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    const filtered = filterProducts(products);
    const totalPages = Math.ceil(filtered.length / rowsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setRowsPerPage(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  const renderTable = (showStatus: boolean = false) => {
    // Ensure products is an array before processing
    if (!Array.isArray(products)) {
      return (
        <div className="overflow-x-auto rounded-lg border border-gray-100 w-full bg-white">
          <div className="p-8 text-center text-gray-500">
            Error: Invalid data format. Please refresh the page.
          </div>
        </div>
      );
    }

    const filtered = filterProducts(products);
    const paginated = getPaginatedProducts(filtered);
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return (
      <div className="overflow-x-auto rounded-lg border border-gray-100 w-full bg-white">
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="bg-[#F5F5F5] text-[13px] font-poppins-regular">
              <th className="p-3 text-left w-[45%]">Product's Name</th>
              <th className="p-3 text-left">SKU</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-left">Vendor</th>
              {showStatus && <th className="p-3 text-left">Status</th>}
              <th className="p-3 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={showStatus ? 7 : 6}
                  className="text-center py-8 text-gray-400"
                >
                  No products found.
                </td>
              </tr>
            )}
            {paginated.map((product) => (
              <tr
                key={product.id}
                className="border-b border-[#E4E4EF] last:border-b-0 hover:bg-[#F9F9F9]"
              >
                <td className="p-3 flex text-[14px] items-center gap-3 min-w-[220px] font-poppins-medium">
                  <img
                    src={product.picture || "/src/assets/img/sharplooklogo.svg"}
                    alt={product.productName}
                    className="w-10 h-10 rounded-full object-cover border border-[#0000001A]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/src/assets/img/sharplooklogo.svg";
                    }}
                  />
                  <div>
                    <div className="font-poppins-medium text-gray-800 text-[14px]">
                      {product.productName}
                    </div>
                    <div className="text-[12px] font-poppins-regular text-[#80808099]">
                      {product.description}
                    </div>
                  </div>
                </td>
                <td className="p-3 text-[14px] font-poppins-medium">
                  {HexConverter(product.id)}
                </td>
                <td className="p-3 text-[14px] font-poppins-medium">
                  {product.qtyAvailable}
                </td>
                <td className="p-3 text-[14px] font-poppins-medium">
                  {product.vendor ? (
                    <div>
                      <div className="font-poppins-medium text-gray-800 text-[14px]">
                        {product.vendor.firstName} {product.vendor.lastName}
                      </div>
                      <div className="text-[12px] font-poppins-regular text-[#80808099]">
                        {product.vendor.vendorOnboarding?.businessName ||
                          product.vendor.email}
                      </div>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>

                {showStatus && (
                  <td className="p-3 text-[14px] font-poppins-medium">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.approvalStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow"
                          : product.approvalStatus === "APPROVED"
                          ? "bg-green-100 text-green"
                          : "bg-red-100 text-red"
                      }`}
                    >
                      {product.approvalStatus === "PENDING"
                        ? "Pending"
                        : product.approvalStatus === "APPROVED"
                        ? "Approved"
                        : product.approvalStatus === "REJECTED"
                        ? "Rejected"
                        : product.approvalStatus}
                    </span>
                  </td>
                )}
                <td className="p-3">
                  {tab === "listings" && (
                    <button
                      className="bg-pink-100 px-5 py-1.5 cursor-pointer rounded text-pink-600 font-medium hover:bg-pink-200 transition"
                      onClick={() =>
                        navigate("/product/detail", { state: { product } })
                      }
                    >
                      View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination and controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-3">
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 rounded border text-sm ${
                page === 1
                  ? "border-gray-200 text-gray-400 bg-white cursor-not-allowed"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              }`}
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
            {getPageNumbers().map((pageNum, index) => (
              <button
                key={index}
                className={`px-3 py-1 rounded cursor-pointer border text-sm ${
                  pageNum === page
                    ? "border-pink-600 bg-pink-600 text-white"
                    : pageNum === "..."
                    ? "border-gray-200 bg-white text-gray-500 cursor-default"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() =>
                  typeof pageNum === "number" && handlePageChange(pageNum)
                }
                disabled={pageNum === "..."}
              >
                {pageNum}
              </button>
            ))}
            <button
              className={`px-3 py-1 rounded border text-sm ${
                page === totalPages
                  ? "border-gray-200 text-gray-400 bg-white cursor-not-allowed"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              }`}
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-500 font-poppins-regular">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
            {totalItems}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-poppins-regular">
              Rows per page
            </span>
            <select
              className="border border-gray-200 rounded px-2 py-1 text-sm"
              value={rowsPerPage}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>
      // <div> new ProductDetail </div>

    );
  };

  if (loading) {
    return (
      <div className="flex h-screen pt-10 bg-lightgray">
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <ScaleLoader color="#eb278d" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen pt-10 bg-lightgray">
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-pink text-white px-4 py-2 rounded-lg"
                >
                  Retry
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-lightgray pt-[80px] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[14px] text-[#909090] font-poppins-regular">
          Admin/Product Management
        </span>
        <span className="text-[14px] text-[#909090] font-poppins-regular">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-6 border-b border-[#D1D2D3] pb-6">
          <div className="relative bg-[#EFF2F6] w-full max-w-[500px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch size={18} />
            </span>
            <input
              type="text"
              placeholder="Search products by name, description, or ID"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 rounded bg-[#EFF2F6] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-100 text-[15px]"
            />
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#E4E4EF] pb-4 mb-4">
          <button
            className={`px-5 py-2 font-semibold cursor-pointer rounded-full focus:outline-none transition text-[15px] ${
              tab === "listings" ? "bg-[#EFF2F6] text-black " : "text-[#C5C5C5]"
            }`}
            onClick={() => setTab("listings")}
          >
            Product Listings
          </button>
          <button
            className={`px-5 py-2 font-semibold cursor-pointer rounded-full focus:outline-none transition text-[15px] ${
              tab === "approval" ? "bg-[#EFF2F6] text-black " : "text-[#C5C5C5]"
            }`}
            onClick={() => setTab("approval")}
          >
            Product Approval
          </button>
        </div>
        {tab === "listings" && renderTable(false)}
        {tab === "approval" && renderTable(true)}
      </div>
    </div>
  );
};

export default Product;
