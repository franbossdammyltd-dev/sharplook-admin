import { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Delete from "../../assets/img/delete-icon.png";
import Modal from "../../components/Modal";
import { HttpClient } from "../../../api/HttpClient";
import { ScaleLoader } from "react-spinners";
import AddService from "./AddService";

// Service category interface
interface ServiceCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Service listing interface
interface ServiceListing {
  id: string;
  userId: string;
  serviceName: string;
  servicePrice: number;
  serviceImage: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  vendor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// API response interfaces
interface ServiceResponse {
  success: boolean;
  data: ServiceCategory[];
}

interface ServiceListingsResponse {
  success: boolean;
  data: ServiceListing[];
}

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];

const Services = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"categories" | "listings">(
    "categories"
  );
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [serviceListings, setServiceListings] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch service categories from API
  const fetchServiceCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await HttpClient.get<ServiceResponse>(
        "/admin/getAllServiceCategory"
      );

   
      if (response.data.success) {
        setServices(response.data.data);
      } else {
        setError("Failed to fetch service categories");
      }
    } catch {
      setError("Failed to fetch service categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch service listings from API
  const fetchServiceListings = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with the correct endpoint for service listings
      // Current endpoint: "/admin/services"
      // Possible alternatives: "/admin/getAllServices", "/admin/serviceListings", etc.
      const response = await HttpClient.get<ServiceListingsResponse>(
        "/admin/services"
      );

      if (response.data.success) {
        setServiceListings(response.data.data);
      } else {
        setError("Failed to fetch service listings");
      }
    } catch {
      // For now, set empty array if endpoint doesn't exist
      setServiceListings([]);
      // Uncomment the line below if you want to show error instead
      // setError("Failed to fetch service listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "categories") {
      fetchServiceCategories();
    } else {
      fetchServiceListings();
    }
  }, [activeTab, refreshTrigger]);

  // Filtered and paginated data for categories
  const filteredCategories = services.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalCategories = filteredCategories.length;
  const totalPagesCategories = Math.ceil(totalCategories / rowsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Filtered and paginated data for listings
  // const filteredListings = serviceListings.filter(
  //   (listing) =>
  //     listing.serviceName.toLowerCase().includes(search.toLowerCase()) ||
  //     listing.vendor.firstName.toLowerCase().includes(search.toLowerCase()) ||
  //     listing.vendor.lastName.toLowerCase().includes(search.toLowerCase()) ||
  //     listing.vendor.email.toLowerCase().includes(search.toLowerCase())
  // );
  const filteredListings = serviceListings.filter(
    (listing) =>
      listing.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      listing.vendor?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      listing.vendor?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      listing.vendor?.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalListings = filteredListings.length;
  const totalPagesListings = Math.ceil(totalListings / rowsPerPage);
  const paginatedListings = filteredListings.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === "categories") {
      return {
        data: paginatedCategories,
        total: totalCategories,
        totalPages: totalPagesCategories,
      };
    } else {
      return {
        data: paginatedListings,
        total: totalListings,
        totalPages: totalPagesListings,
      };
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };
  // Render service listings table
  const renderServiceListings = () => {
    return paginatedListings.map((listing: ServiceListing) => (
      <tr
        key={listing.id}
        className="border-b border-[#E4E4EF] last:border-b-0 hover:bg-[#F9F9F9]"
      >
        <td className="p-3 flex text-[14px] items-center gap-3 min-w-[220px] font-poppins-medium">
          <img
            src={listing.serviceImage || "/src/assets/img/sharplooklogo.svg"}
            alt={listing.serviceName}
            className="w-10 h-10 rounded-full object-cover border border-[#0000001A]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/src/assets/img/sharplooklogo.svg";
            }}
          />
          <div>
            <div className="font-poppins-medium text-gray-800 text-[14px]">
              {listing.serviceName}
            </div>
            <div className="text-[12px] font-poppins-regular text-[#80808099]">
              {listing.description}
            </div>
          </div>
        </td>
        <td className="p-3 text-[14px] font-poppins-medium">
          {formatDate(listing.createdAt)}
        </td>
        <td className="p-3 text-[14px] font-poppins-medium">
          {formatCurrency(listing.servicePrice)}
        </td>
        <td className="p-3 text-[14px] font-poppins-medium">
          <div>
            {/* <div className="font-poppins-medium text-gray-800 text-[14px]">
              {listing.vendor.firstName} {listing.vendor.lastName}
            </div>
            <div className="text-[12px] font-poppins-regular text-[#80808099]">
              {listing.vendor.email}
            </div> */}
            <div className="font-poppins-medium text-gray-800 text-[14px]">
              {listing.vendor ? `${listing.vendor.firstName} ${listing.vendor.lastName}` : "N/A"}
            </div>
            <div className="text-[12px] font-poppins-regular text-[#80808099]">
              {listing.vendor?.email || "No Email"}
            </div>

          </div>
        </td>
        <td className="p-3">
          <button
            className="bg-pink-100 px-5 py-1.5 cursor-pointer rounded text-pink-600 font-medium hover:bg-pink-200 transition"
            onClick={() =>
              navigate("/services/detail", { state: { service: listing } })
            }
          >
            View
          </button>
        </td>
      </tr>
    ));
  };

// updated service listings table
// Render service listings table (safe version)
// const renderServiceListings = () => {
//   return paginatedListings.map((listing: ServiceListing) => {
//     const vendorName = listing.vendor
//       ? `${listing.vendor.firstName || ""} ${listing.vendor.lastName || ""}`.trim()
//       : "N/A";
//     const vendorEmail = listing.vendor?.email || "No Email";
//     const serviceImageSrc =
//       listing.serviceImage || "/src/assets/img/sharplooklogo.svg";

//     return (
//       <tr
//         key={listing.id}
//         className="border-b border-[#E4E4EF] last:border-b-0 hover:bg-[#F9F9F9]"
//       >
//         <td className="p-3 flex text-[14px] items-center gap-3 min-w-[220px] font-poppins-medium">
//           <img
//             src={serviceImageSrc}
//             alt={listing.serviceName || "Service"}
//             className="w-10 h-10 rounded-full object-cover border border-[#0000001A]"
//             onError={(e) => {
//               const target = e.target as HTMLImageElement;
//               target.src = "/src/assets/img/sharplooklogo.svg";
//             }}
//           />
//           <div>
//             <div className="font-poppins-medium text-gray-800 text-[14px]">
//               {listing.serviceName || "No Name"}
//             </div>
//             <div className="text-[12px] font-poppins-regular text-[#80808099]">
//               {listing.description || "No Description"}
//             </div>
//           </div>
//         </td>
//         <td className="p-3 text-[14px] font-poppins-medium">
//           {listing.createdAt ? formatDate(listing.createdAt) : "N/A"}
//         </td>
//         <td className="p-3 text-[14px] font-poppins-medium">
//           {listing.servicePrice != null ? formatCurrency(listing.servicePrice) : "N/A"}
//         </td>
//         <td className="p-3 text-[14px] font-poppins-medium">
//           <div>
//             <div className="font-poppins-medium text-gray-800 text-[14px]">
//               {vendorName}
//             </div>
//             <div className="text-[12px] font-poppins-regular text-[#80808099]">
//               {vendorEmail}
//             </div>
//           </div>
//         </td>
//         <td className="p-3">
//           <button
//             className="bg-pink-100 px-5 py-1.5 cursor-pointer rounded text-pink-600 font-medium hover:bg-pink-200 transition"
//             onClick={() =>
//               navigate("/services/detail", { state: { service: listing } })
//             }
//           >
//             View
//           </button>
//         </td>
//       </tr>
//     );
//   });
// };


  // Render service categories table
  const renderServiceCategories = () => {
    return paginatedCategories.map((service: ServiceCategory) => (
      <tr
        key={service.id}
        className="border-b border-[#E4E4EF] last:border-b-0 hover:bg-[#F9F9F9]"
      >
        <td className="p-3 text-[14px] font-poppins-medium">{service.name}</td>
        <td className="p-3 text-[14px] font-poppins-medium">
          {formatDate(service.createdAt)}
        </td>

        <td className="p-3">
          <button
            className="text-gray-400 cursor-pointer hover:text-red-500"
            onClick={() => handleDelete(service)}
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </td>
      </tr>
    ));
  };

  // Pagination controls
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => {
    const { totalPages } = getCurrentData();
    setPage((p) => Math.min(totalPages, p + 1));
  };
  const handleRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // Delete logic for categories
  const [serviceToDelete, setServiceToDelete] =
    useState<ServiceCategory | null>(null);

  const handleDelete = (service: ServiceCategory) => {
    setServiceToDelete(service);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      setLoading(true);
      const response = await HttpClient.delete(
        `/admin/deleteServiceCategory/${serviceToDelete.id}`
      );

      if (response.data.success) {
        setDeleteModal(false);
        setDeleteSuccess(true);
        setTimeout(() => setDeleteSuccess(false), 1500);
        // Refresh the services list
        setRefreshTrigger((prev) => prev + 1);
      } else {
        setError("Failed to delete service");
      }
    } catch {
      setError("Failed to delete service. Please try again.");
    } finally {
      setLoading(false);
      setServiceToDelete(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const handleBackFromAddService = () => {
    setShowAddService(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  if (showAddService) {
    return <AddService onBack={handleBackFromAddService} />;
  }

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
              <div className="text-red-500 text-center">
                <div className="mb-2">{error}</div>
                <button
                  onClick={() =>
                    activeTab === "categories"
                      ? fetchServiceCategories()
                      : fetchServiceListings()
                  }
                  className="bg-pink text-white px-4 py-2 rounded"
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

  const { data: currentData, total, totalPages } = getCurrentData();

  return (
    <div className="flex h-screen pt-10 bg-lightgray">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="text-[14px] text-[#909090] font-poppins-regular">
              Admin/Service
            </div>
            <div className="text-[14px] text-[#909090] font-poppins-regular">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex-1 flex items-center bg-[#EFF2F6] rounded-lg px-4">
                <svg
                  className="w-5 h-5 text-gray-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0Z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder={
                    activeTab === "categories"
                      ? "Search Service"
                      : "Search by service"
                  }
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent outline-none w-full py-[14px] text-[12px] font-poppins-regular"
                />
              </div>
              {activeTab === "categories" && (
                <button
                  onClick={() => setShowAddService(true)}
                  className="bg-pink cursor-pointer text-white px-6 py-2 rounded font-poppins-regular text-[14px] ml-auto flex items-center gap-2"
                >
                  + Add New Service
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[#E4E4EF] pb-4 mb-4">
              <button
                className={`px-5 py-2 font-semibold cursor-pointer rounded-full focus:outline-none transition text-[15px] ${activeTab === "categories"
                    ? "bg-[#EFF2F6] text-black"
                    : "text-[#C5C5C5]"
                  }`}
                onClick={() => setActiveTab("categories")}
              >
                Service Categories
              </button>
              <button
                className={`px-5 py-2 font-semibold cursor-pointer rounded-full focus:outline-none transition text-[15px] ${activeTab === "listings"
                    ? "bg-[#EFF2F6] text-black"
                    : "text-[#C5C5C5]"
                  }`}
                onClick={() => setActiveTab("listings")}
              >
                Service Listed
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100 w-full">
              <table className="min-w-full bg-white text-sm">
                <thead>
                  <tr className="bg-[#F5F5F5] font-poppins-regular">
                    {activeTab === "listings" ? (
                      <>
                        <th className="p-3 text-left text-[13px]">
                          Service's Name
                        </th>
                        <th className="p-3 text-left text-[13px]">
                          Date Listed
                        </th>
                        <th className="p-3 text-left text-[13px]">Amount</th>
                        <th className="p-3 text-left text-[13px]">Vendor</th>
                        <th className="p-3 text-left text-[13px] w-16"></th>
                      </>
                    ) : (
                      <>
                        <th className="p-3 text-left text-[13px]">Service</th>
                        <th className="p-3 text-left text-[13px]">
                          Date Added
                        </th>
                        <th className="p-3 text-left text-[13px] w-16"></th>
                        <th className="p-3 text-left text-[13px] w-16"></th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={activeTab === "listings" ? 5 : 4}
                        className="text-center py-8 text-gray-400"
                      >
                        No{" "}
                        {activeTab === "listings"
                          ? "services"
                          : "service categories"}{" "}
                        found.
                      </td>
                    </tr>
                  ) : activeTab === "listings" ? (
                    // Service Listings Table
                    renderServiceListings()
                  ) : (
                    // Service Categories Table
                    renderServiceCategories()
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-3">
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded border border-gray-200 text-gray-400 bg-white"
                  onClick={handlePrev}
                  disabled={page === 1}
                >
                  Prev
                </button>
                {[...Array(totalPages).keys()].slice(0, 3).map((i) => (
                  <button
                    key={i + 1}
                    className={`px-3 py-1 rounded border ${page === i + 1
                        ? "border-pink-600 bg-pink-600 text-white"
                        : "border-gray-200 bg-white"
                      }`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                {totalPages > 3 && <span className="px-2">...</span>}
                <button
                  className="px-3 py-1 rounded border border-gray-200 bg-white"
                  onClick={handleNext}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
              <div className="text-sm text-gray-500 font-poppins-regular">
                Showing {total === 0 ? 0 : (page - 1) * rowsPerPage + 1} to{" "}
                {Math.min(page * rowsPerPage, total)} of {total}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-poppins-regular">
                  Rows per page
                </span>
                <select
                  className="border border-gray-200 rounded px-2 py-1 text-sm"
                  value={rowsPerPage}
                  onChange={handleRowsPerPage}
                >
                  {ROWS_PER_PAGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Delete Modal */}
      <Modal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
        }}
      >
        <div className="p-10">
          <h1 className="font-poppins-regular text-center text-[14px]">
            Are you sure you want to delete this service?
          </h1>
          <div className="flex justify-center gap-4 pt-10">
            <button
              className="bg-red cursor-pointer text-white px-8 py-2 rounded-[4px] flex items-center justify-center min-w-[80px]"
              onClick={confirmDelete}
            >
              Yes
            </button>
            <button
              className="text-red border cursor-pointer border-red px-8 py-2 rounded-[4px]"
              onClick={() => {
                setDeleteModal(false);
              }}
            >
              No
            </button>
          </div>
        </div>
      </Modal>
      {/* Success Modal */}
      <Modal open={deleteSuccess} onClose={() => setDeleteSuccess(false)}>
        <div className="p-10">
          <div className="flex justify-center">
            <img src={Delete} className="w-[150px] h-[150px]" alt="delete" />
          </div>
          <h1 className="font-poppins-regular text-center text-[14px]">
            Service deleted successfully
          </h1>
        </div>
      </Modal>
    </div>
  );
};

export default Services;
