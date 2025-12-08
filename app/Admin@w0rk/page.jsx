"use client";
import LocationInput from "@/components/LocationInput";
import { Pencil, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Admin = () => {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pendingOrder, setPendingOrder] = useState([]);
  const [finishedOrder, setFinishedOrder] = useState([]);
  const [requestOrders, setRequestOrders] = useState([]);
  const [filterIndex, setFilterIndex] = useState(5);
  const [confirming, setConfirming] = useState({ email: "", orderId: "" });
  const [displayIndex, setDisplayIndex] = useState(0);
  const [displayData, setDisplayData] = useState([]);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogMetaTitle, setBlogMetaTitle] = useState("");
  const [blogMetaDescription, setBlogMetaDescription] = useState("");
  const [blogImage, setBlogImage] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogType, setBlogType] = useState(0);
  const [blogContent, setBlogContent] = useState([
    { type: "title", content: "" },
  ]);
  const [insertIndex, setInsertIndex] = useState(blogContent.length);
  const [allBlogs, setAllBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [deletingBlog, setDeletingBlog] = useState(null);
  const [reportDetails, setReportDetails] = useState({
    name: "",
    dob: "",
    time: "",
    place: "",
    gender: "",
    lat: "",
    lon: "",
    plan: "",
    mail: "",
  });
  const [locationInput, setLocationInput] = useState("");
  const [place, setPlace] = useState("");
  const [latLon, setLatLon] = useState({
    lat: "",
    lon: "",
    timezone: "",
    currency: "",
  });

  useEffect(() => {
    if (editingBlog) {
      setInsertIndex(blogContent.length);
    } else {
      setInsertIndex(blogContent.length + 1);
    }
  }, [blogContent]);

  const fetchAllBlogs = async () => {
    try {
      const res = await fetch("/api/getAllPosts", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200) {
        const data = await res.json();
        setAllBlogs(data);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleDeleteBlog = async (slug) => {
    try {
      setLoading(true);
      const res = await fetch("/api/deletePost", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (res.status === 200) {
        setAllBlogs(allBlogs.filter((blog) => blog.slug !== slug));
        setDeletingBlog(null);
        toast.success("Blog deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Failed to delete blog", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Error deleting blog", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedBlog = {
        title: blogTitle,
        metaTitle: blogMetaTitle,
        metaDescription: blogMetaDescription,
        slug: blogSlug.trim(),
        type: blogType,
        content: blogContent,
        createdAt: editingBlog.createdAt,
        _id: editingBlog._id,
      };

      const res = await fetch("/api/updatePost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBlog),
      });

      if (res.status === 200) {
        setAllBlogs(
          allBlogs.map((b) => (b.slug === blogSlug ? updatedBlog : b))
        );
        setEditingBlog(null);
        setBlogTitle("");
        setBlogMetaTitle("");
        setBlogMetaDescription("");
        setBlogSlug("");
        setBlogType(0);
        setBlogContent([{ type: "title", content: "" }]);
        setInsertIndex(0);
        toast.success("Blog updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Failed to update blog", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error("Error updating blog", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllBlogs();
    }
  }, [isAdmin]);

  const typesOfBlogs = [
    "Parenting Tips",
    "Astrology Basics",
    "Ayurveda",
    "Wellness",
    "Success Stories",
  ];

  const ageOption = [
    "Age (0 - 4 Years)",
    "Age (5 - 10 Years)",
    "Age (11 - 15 Years)",
    "Age (16 - 20 Years)",
  ];

  const plans = [
    "Starter Parenting",
    "Pro Parenting",
    "Ultimate Parenting",
    "Master Parenting",
  ];

  const handleCheckboxChange = (email, orderId) => {
    setConfirming({ email: email, orderId: orderId });
  };

  const getChildDetails = async () => {
    setPageLoading(true);
    setPendingOrder([]);
    setFinishedOrder([]);
    setRequestOrders([]);

    const res = await fetch("/api/getChildDetails", { method: "POST" });
    const res1 = await fetch("/api/getrequestDetails", { method: "POST" });

    const details = await res.json();
    const details1 = await res1.json();

    const pendingOrderRes = [];
    const finishedOrderRes = [];
    const requestOrders = [];

    details.map((item) => {
      item.childDetails.map((child) => {
        if (child.isChecked == false) {
          pendingOrderRes.unshift({
            id: item.id,
            name: child.name,
            dob: child.dob,
            time: child.time,
            place: child.place,
            gender: child.gender,
            email: item.email,
            number: child.number,
            orderId: child.orderId,
            changes: child.isChange,
            plan: child.plan,
            lat: child.lat,
            lon: child.lon,
            createdAt: child.addedAt,
          });
        } else {
          finishedOrderRes.unshift({
            id: item.id,
            name: child.name,
            dob: child.dob,
            time: child.time,
            place: child.place,
            gender: child.gender,
            email: item.email,
            number: child.number,
            orderId: child.orderId,
            changes: child.isChange,
            plan: child.plan ? child.plan : "Late Teen",
            createdAt: child.addedAt,
          });
        }
      });
    });

    setPendingOrder(pendingOrderRes);
    setFinishedOrder(finishedOrderRes);
    setDisplayIndex(0);
    setPageLoading(false);
    setDisplayData(pendingOrder);

    details1.map((item) => {
      item.childDetails.map((child) => {
        requestOrders.push({
          id: item.id,
          name: child.name,
          dob: child.dob,
          time: child.time,
          place: child.place,
          gender: child.gender,
          email: item.email,
          number: child.number,
          createdAt: child.addedAt,
        });
      });
    });
    setRequestOrders(
      requestOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    );
  };

  const adminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/adminLogin", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (res.status === 200) {
      setIsAdmin(true);
      getChildDetails();
      setDisplayData(pendingOrder);
      setDisplayIndex(0);
    } else {
      toast.error("Invalid Credentials", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    setLoading(false);
  };

  const handleConfirm = async (email, orderId) => {
    try {
      setLoading(true);
      const res = await fetch("/api/updateChildDetails", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, isChecked: true, orderId }),
      });
      if (res.status === 200) {
        getChildDetails();
        setConfirming({ email: "", orderId: "" });
      } else {
        console.log("Failed to update child status");
      }
      setLoading(false);
    } catch (error) {
      console.log("Error updating child status:", error);
    }
  };

  const HandleReport = async (item) => {
    setLoading(true);
    const res = await fetch("/api/generateReport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dob: `${item.dob} ${item.time}:00`,
        location: item.place.split(",")[0],
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        gender: item.gender,
        name: item.name,
        input: plans.indexOf(item.plan) + 1,
        email: item.email,
        timezone: item.timezone,
      }),
    });
    setLoading(false);
    if (res.status == 200) {
      toast.success("Check Mail", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const generateReport = async () => {
    setPageLoading(true);
    const res = await fetch("/api/generateReport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dob: `${reportDetails.dob} ${reportDetails.time}:00`,
        location: reportDetails.place.split(",")[0],
        lat: parseFloat(latLon.lat),
        lon: parseFloat(latLon.lon),
        gender: reportDetails.gender,
        name: reportDetails.name,
        input: plans.indexOf(reportDetails.plan) + 1,
        email:
          reportDetails.mail.trim() == ""
            ? "guruvijay1925@gmail.com"
            : reportDetails.mail.trim(),
        timezone: latLon.timezone,
      }),
    });
    setPageLoading(false);
    if (res.status == 200) {
      toast.success("Check Mail", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const processState = (time, status) => {
    if (displayData == 1) return "Report Generated";
    const date = new Date(time);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    if (status) return "Generate Report";
    return diffTime < 10800000 ? "Wait For Update" : "Generate Report";
  };

  const handleCancel = () => {
    setConfirming({ id: 0, name: "" });
  };

  const foramtDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleBlogTableAddColumn = (tableIndex) => {
    const newContent = [...blogContent];
    newContent[tableIndex] = {
      ...newContent[tableIndex],
      headers: [
        ...newContent[tableIndex].headers,
        `Column ${newContent[tableIndex].headers.length + 1}`,
      ],
      rows: newContent[tableIndex].rows.map((row) => [...row, ""]),
    };
    setBlogContent(newContent);
  };

  const handleBlogTableAddRow = (tableIndex) => {
    const newContent = [...blogContent];
    newContent[tableIndex] = {
      ...newContent[tableIndex],
      rows: [
        ...newContent[tableIndex].rows,
        Array(newContent[tableIndex].headers.length).fill(""),
      ],
    };
    setBlogContent(newContent);
  };

  const handleBlogTableCellChange = (tableIndex, rowIndex, colIndex, value) => {
    const newContent = [...blogContent];
    const newRows = [...newContent[tableIndex].rows];
    newRows[rowIndex][colIndex] = value;
    newContent[tableIndex] = {
      ...newContent[tableIndex],
      rows: newRows,
    };
    setBlogContent(newContent);
  };

  const handleBlogTableHeaderChange = (tableIndex, colIndex, value) => {
    const newContent = [...blogContent];
    const newHeaders = [...newContent[tableIndex].headers];
    newHeaders[colIndex] = value;
    newContent[tableIndex] = {
      ...newContent[tableIndex],
      headers: newHeaders,
    };
    setBlogContent(newContent);
  };
  const handleAddBlog = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const blogData = {
        title: blogTitle,
        metaTitle: blogMetaTitle,
        metaDescription: blogMetaDescription,
        image: blogImage,
        slug: blogSlug.trim(),
        type: blogType,
        content: blogContent,
        createdAt: new Date(),
      };

      const res = await fetch("/api/addPost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogData),
      });

      if (res.status === 201) {
        toast.success("Blog post added successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        setBlogTitle("");
        setBlogMetaTitle("");
        setBlogMetaDescription("");
        setBlogImage("");
        setBlogSlug("");
        setBlogType(1);
        setBlogContent([{ type: "title", content: "" }]);
        setInsertIndex(blogContent.length - 1);
      } else {
        toast.error("Failed to add blog post. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error adding blog post:", error);
      toast.error("An error occurred while adding the blog post", {
        position: "top-right",
        autoClose: 3000,
      });
    }

    setLoading(false);
  };

  return (
    <div>
      {pageLoading ? (
        <div className="w-screen h-screen bg-black bg-opacity-40 flex justify-center items-center">
          loading....
        </div>
      ) : isAdmin ? (
        <div className="w-screen h-screen overflow-hidden bg-white text-black pt-5">
          <div className="flex justify-center items-center mb-4 px-6">
            <h1 className="text-2xl md:flex-1 font-bold xl:text-center flex-1">
              Report Progress
            </h1>
            <button
              className="text-blue-400 text-end"
              onClick={getChildDetails}
            >
              Refresh
            </button>
          </div>
          <div className="flex xl:flex-row flex-col w-full h-full overflow-hidden">
            <div className="flex flex-col px-10">
              <button
                onClick={() => {
                  setDisplayData(pendingOrder);
                  setDisplayIndex(0);
                  setFilterIndex(5);
                }}
                className={`${
                  displayIndex == 0 ? "text-blue-500" : "text-black"
                }`}
              >
                Pending Orders ({pendingOrder.length})
              </button>
              {displayIndex == 0 &&
                plans.map((plan, index) => (
                  <div key={index}>
                    <button
                      onClick={() => {
                        setDisplayData(
                          pendingOrder.filter((item) => item.plan == plan)
                        );
                        setFilterIndex(index);
                      }}
                      className={`w-full text-black text-center ${
                        pendingOrder.length > 0 ? "block" : "hidden"
                      } ${
                        filterIndex == index ? "text-blue-500" : "text-black"
                      }`}
                    >
                      {plan}
                    </button>
                  </div>
                ))}
              <button
                onClick={() => {
                  setDisplayData(finishedOrder);
                  setDisplayIndex(1);
                  setFilterIndex(5);
                }}
                className={`${
                  displayIndex == 1 ? "text-blue-500" : "text-black"
                }`}
              >
                Finished Orders ({finishedOrder.length})
              </button>
              {displayIndex == 1 &&
                plans.map((plan, index) => (
                  <div key={index}>
                    <button
                      onClick={() => {
                        setDisplayData(
                          finishedOrder.filter((item) => item.plan == plan)
                        );
                        setFilterIndex(index);
                      }}
                      className={`w-full text-black text-center ${
                        finishedOrder.length > 0 ? "block" : "hidden"
                      } ${
                        filterIndex == index ? "text-blue-500" : "text-black"
                      }`}
                    >
                      {plan}
                    </button>
                  </div>
                ))}
              <button
                onClick={() => {
                  setDisplayData(requestOrders);
                  setDisplayIndex(2);
                }}
                className={`${
                  displayIndex == 2 ? "text-blue-500" : "text-black"
                }`}
              >
                Non Payment Orders ({requestOrders.length})
              </button>

              <button
                onClick={() => {
                  setDisplayIndex(6);
                  setDisplayData([]);
                }}
                className={`${
                  displayIndex == 6 ? "text-blue-500" : "text-black"
                }`}
              >
                Add Blog
              </button>
              <button
                onClick={() => {
                  setDisplayIndex(7);
                  setDisplayData(allBlogs);
                  fetchAllBlogs();
                }}
                className={`${
                  displayIndex === 7 ? "text-blue-500" : "text-black"
                }`}
              >
                All Blogs ({allBlogs.length})
              </button>
              <button
                onClick={() => {
                  setDisplayIndex(8);
                  setDisplayData([]);
                }}
                className={`${
                  displayIndex === 8 ? "text-blue-500" : "text-black"
                }`}
              >
                Generate Report
              </button>
            </div>
            <div className="overflow-y-scroll flex-1 pb-10 flex flex-col">
              {displayIndex === 8 && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Generate Report</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      generateReport();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-gray-700">Name</label>
                      <input
                        type="text"
                        value={reportDetails.name}
                        onChange={(e) =>
                          setReportDetails({
                            ...reportDetails,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700">DOB</label>
                      <input
                        type="date"
                        value={reportDetails.dob}
                        onChange={(e) =>
                          setReportDetails({
                            ...reportDetails,
                            dob: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700">Time</label>
                      <input
                        type="time"
                        value={reportDetails.time}
                        onChange={(e) =>
                          setReportDetails({
                            ...reportDetails,
                            time: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        required
                      />
                    </div>
                    <div className="w-full relative">
                      <label className="block text-[14px] font-normal mb-1">
                        Location
                      </label>
                      <LocationInput
                        locationInput={locationInput}
                        setLocationInput={setLocationInput}
                        setPlace={setPlace}
                        setLatLon={setLatLon}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700">Gender</label>
                      <select
                        value={reportDetails.gender}
                        onChange={(e) =>
                          setReportDetails({
                            ...reportDetails,
                            gender: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700">Plan</label>
                      <select
                        value={reportDetails.plan}
                        onChange={(e) =>
                          setReportDetails({
                            ...reportDetails,
                            plan: e.target.value,
                          })
                        }
                        onSelect={(e) =>
                          setReportDetails({
                            ...reportDetails,
                            plan: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                      >
                        <option value="">Select Plan</option>
                        {plans.map((plan, index) => (
                          <option key={index} value={plan}>
                            {plan}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700">Email</label>
                      <input
                        type="email"
                        value={reportDetails.mail}
                        onChange={(e) =>
                          setReportDetails({
                            ...reportDetails,
                            mail: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Generate Report
                    </button>
                  </form>
                </div>
              )}
              {displayIndex === 7 ? (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">All Blogs</h2>
                  {editingBlog ? (
                    <form
                      onSubmit={
                        displayIndex === 6 ? handleAddBlog : handleUpdateBlog
                      }
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-gray-700">Title</label>
                        <input
                          type="text"
                          value={blogTitle}
                          onChange={(e) => setBlogTitle(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded mt-1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={blogMetaTitle}
                          onChange={(e) => setBlogMetaTitle(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded mt-1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">
                          Meta Description
                        </label>
                        <input
                          type="text"
                          value={blogMetaDescription}
                          onChange={(e) =>
                            setBlogMetaDescription(e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded mt-1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">Image</label>
                        <input
                          type="text"
                          value={blogImage}
                          onChange={(e) => setBlogImage(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded mt-1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">Slug</label>
                        <input
                          type="text"
                          value={blogSlug}
                          onChange={(e) => setBlogSlug(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded mt-1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700">Type</label>
                        <select
                          value={blogType}
                          onChange={(e) =>
                            setBlogType(parseInt(e.target.value))
                          }
                          className="w-full p-2 border border-gray-300 rounded mt-1"
                        >
                          {typesOfBlogs.map((type, index) => (
                            <option key={index} value={index + 1}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Content Sections
                        </label>
                        {blogContent.map((section, index) => (
                          <div key={index} className="border p-4 mb-4 rounded">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-lg font-semibold">
                                Section {index + 1}
                              </h3>
                              <button
                                type="button"
                                onClick={() => {
                                  const newContent = [...blogContent];
                                  newContent.splice(index, 1);
                                  setBlogContent(newContent);
                                }}
                                className="text-red-500"
                              >
                                <Trash2 />
                              </button>
                            </div>
                            <div className="mb-2">
                              <label className="block text-gray-700">
                                Section Type
                              </label>
                              <select
                                value={section.type}
                                onChange={(e) => {
                                  const newContent = [...blogContent];
                                  newContent[index].type = e.target.value;
                                  if (e.target.value === "table") {
                                    newContent[index] = {
                                      type: "table",
                                      headers: ["Column 1"],
                                      rows: [[""]],
                                    };
                                  } else if (
                                    e.target.value === "title" ||
                                    e.target.value === "subtitle" ||
                                    e.target.value === "subtitle1" ||
                                    e.target.value === "para" ||
                                    e.target.value === "summary"
                                  ) {
                                    newContent[index] = {
                                      type: e.target.value,
                                      content: "",
                                    };
                                  } else if (e.target.value === "image") {
                                    newContent[index] = {
                                      type: "image",
                                      content: "",
                                      image: "",
                                      alt: "",
                                    };
                                  } else if (e.target.value === "points") {
                                    newContent[index] = {
                                      type: "points",
                                      points: [{ title: "", content: "" }],
                                    };
                                  } else if (
                                    e.target.value === "points-points"
                                  ) {
                                    newContent[index] = {
                                      type: "points-points",
                                      content: [
                                        {
                                          title: "",
                                          content: "",
                                          subtitle: "",
                                          points: [""],
                                        },
                                      ],
                                    };
                                  } else if (
                                    e.target.value ===
                                    "points-points-with-image"
                                  ) {
                                    newContent[index] = {
                                      type: "points-points-with-image",
                                      content: [
                                        {
                                          title: "",
                                          image: "",
                                          content: "",
                                          subtitle: "",
                                          points: [""],
                                        },
                                      ],
                                    };
                                  } else if (
                                    e.target.value === "numbered-list" ||
                                    e.target.value === "checklist"
                                  ) {
                                    newContent[index] = {
                                      type: e.target.value,
                                      items: [""],
                                    };
                                  } else if (e.target.value === "faq") {
                                    newContent[index] = {
                                      type: "faq",
                                      items: [{ question: "", answer: "" }],
                                    };
                                  } else if (
                                    e.target.value === "highlight-list"
                                  ) {
                                    newContent[index] = {
                                      type: "highlight-list",
                                      items: [{ title: "", content: "" }],
                                    };
                                  } else if (e.target.value === "cta") {
                                    newContent[index] = {
                                      type: "cta",
                                      content: "",
                                      buttonText: "",
                                      link: "",
                                      content2: "",
                                    };
                                  }
                                  setBlogContent(newContent);
                                }}
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                              >
                                <option value="title">Title</option>
                                <option value="subtitle">Subtitle</option>
                                <option value="subtitle1">Subtitle1</option>
                                <option value="para">Paragraph</option>
                                <option value="image">Image</option>
                                <option value="points">Points</option>
                                <option value="points-points">
                                  Points-Points
                                </option>
                                <option value="points-points-with-image">
                                  Points-Points with Image
                                </option>
                                <option value="numbered-list">
                                  Numbered List
                                </option>
                                <option value="summary">Summary</option>
                                <option value="faq">FAQ</option>
                                <option value="checklist">Checklist</option>
                                <option value="highlight-list">
                                  Highlight List
                                </option>
                                <option value="table">Table</option>
                                <option value="cta">Call to Action</option>
                              </select>
                            </div>

                            {(section.type === "title" ||
                              section.type === "subtitle" ||
                              section.type === "subtitle1" ||
                              section.type === "para" ||
                              section.type === "summary") && (
                              <div>
                                <label className="block text-gray-700">
                                  Content
                                </label>
                                <input
                                  type="text"
                                  value={section.content}
                                  onChange={(e) => {
                                    const newContent = [...blogContent];
                                    newContent[index].content = e.target.value;
                                    setBlogContent(newContent);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded mt-1"
                                  required
                                />
                              </div>
                            )}

                            {section.type === "cta" && (
                              <>
                                <div>
                                  <label className="block text-gray-700">
                                    Content
                                  </label>
                                  <input
                                    type="text"
                                    value={section.content}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].content =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-gray-700">
                                    Button Text
                                  </label>
                                  <input
                                    type="text"
                                    value={section.buttonText}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].buttonText =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-gray-700">
                                    Link
                                  </label>
                                  <input
                                    type="text"
                                    value={section.link}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].link = e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-gray-700">
                                    Additional Content
                                  </label>
                                  <input
                                    type="text"
                                    value={section.content2}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].content2 =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                  />
                                </div>
                              </>
                            )}

                            {section.type === "image" && (
                              <>
                                <div>
                                  <label className="block text-gray-700">
                                    Caption
                                  </label>
                                  <input
                                    type="text"
                                    value={section.content}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].content =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-gray-700">
                                    Image URL
                                  </label>
                                  <input
                                    type="text"
                                    value={section.image}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].image = e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-gray-700">
                                    Alt Text
                                  </label>
                                  <input
                                    type="text"
                                    value={section.alt}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].alt = e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                  />
                                </div>
                              </>
                            )}

                            {section.type === "table" && (
                              <div>
                                <div className="mb-4 flex gap-4">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleBlogTableAddColumn(index)
                                    }
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                  >
                                    Add Column
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleBlogTableAddRow(index)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                  >
                                    Add Row
                                  </button>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                      <tr>
                                        {section.headers.map(
                                          (header, colIndex) => (
                                            <th
                                              key={colIndex}
                                              className="border border-gray-300 p-2"
                                            >
                                              <input
                                                type="text"
                                                value={header}
                                                onChange={(e) =>
                                                  handleBlogTableHeaderChange(
                                                    index,
                                                    colIndex,
                                                    e.target.value
                                                  )
                                                }
                                                className="w-full p-1 border-none focus:outline-none"
                                              />
                                            </th>
                                          )
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {section.rows.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                          {row.map((cell, colIndex) => (
                                            <td
                                              key={colIndex}
                                              className="border border-gray-300 p-2"
                                            >
                                              <input
                                                type="text"
                                                value={cell}
                                                onChange={(e) =>
                                                  handleBlogTableCellChange(
                                                    index,
                                                    rowIndex,
                                                    colIndex,
                                                    e.target.value
                                                  )
                                                }
                                                className="w-full p-1 border-none focus:outline-none"
                                              />
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {section.type === "points" && (
                              <div>
                                {section.points.map((point, pIndex) => (
                                  <div
                                    key={pIndex}
                                    className="mb-2 flex flex-col gap-2"
                                  >
                                    <label className="block text-gray-700">
                                      Point {pIndex + 1}
                                    </label>
                                    <input
                                      type="text"
                                      value={point.title}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].points[pIndex].title =
                                          e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder="Title"
                                      required
                                    />
                                    <textarea
                                      value={point.content}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].points[
                                          pIndex
                                        ].content = e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder="Content"
                                      required
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newContent = [...blogContent];
                                        newContent[index].points.splice(
                                          pIndex,
                                          1
                                        );
                                        setBlogContent(newContent);
                                      }}
                                      className="text-red-500 mt-2"
                                    >
                                      <Trash2 />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newContent = [...blogContent];
                                    newContent[index].points.push({
                                      title: "",
                                      content: "",
                                    });
                                    setBlogContent(newContent);
                                  }}
                                  className="text-blue-500 mt-2"
                                >
                                  Add Point
                                </button>
                              </div>
                            )}

                            {section.type === "points-points" && (
                              <div>
                                {section.content.map((item, iIndex) => (
                                  <div
                                    key={iIndex}
                                    className="mb-4 border p-2 rounded"
                                  >
                                    <div className="flex justify-between">
                                      <label className="block text-gray-700">
                                        Item {iIndex + 1}
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newContent = [...blogContent];
                                          newContent[index].content.splice(
                                            iIndex,
                                            1
                                          );
                                          setBlogContent(newContent);
                                        }}
                                        className="text-red-500"
                                      >
                                        <Trash2 />
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      value={item.title}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].content[
                                          iIndex
                                        ].title = e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder="Title"
                                      required
                                    />
                                    <textarea
                                      value={item.content}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].content[
                                          iIndex
                                        ].content = e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder="Content"
                                      required
                                    />
                                    <input
                                      type="text"
                                      value={item.subtitle}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].content[
                                          iIndex
                                        ].subtitle = e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder="Subtitle"
                                      required
                                    />
                                    {item.points.map((point, pIndex) => (
                                      <div
                                        key={pIndex}
                                        className="ml-4 mt-2 flex items-center gap-2"
                                      >
                                        <input
                                          type="text"
                                          value={point}
                                          onChange={(e) => {
                                            const newContent = [...blogContent];
                                            newContent[index].content[
                                              iIndex
                                            ].points[pIndex] = e.target.value;
                                            setBlogContent(newContent);
                                          }}
                                          className="w-full p-2 border border-gray-300 rounded mt-1"
                                          placeholder={`Point ${pIndex + 1}`}
                                          required
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newContent = [...blogContent];
                                            newContent[index].content[
                                              iIndex
                                            ].points.splice(pIndex, 1);
                                            setBlogContent(newContent);
                                          }}
                                          className="text-red-500"
                                        >
                                          <Trash2 />
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newContent = [...blogContent];
                                        newContent[index].content[
                                          iIndex
                                        ].points.push("");
                                        setBlogContent(newContent);
                                      }}
                                      className="text-blue-500 mt-2 ml-4"
                                    >
                                      Add Point
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newContent = [...blogContent];
                                    newContent[index].content.push({
                                      title: "",
                                      content: "",
                                      subtitle: "",
                                      points: [""],
                                    });
                                    setBlogContent(newContent);
                                  }}
                                  className="text-blue-500 mt-2"
                                >
                                  Add Item
                                </button>
                              </div>
                            )}

                            {section.type === "points-points-with-image" && (
                              <div>
                                {section.content.map((item, iIndex) => (
                                  <div
                                    key={iIndex}
                                    className="mb-4 border p-2 rounded"
                                  >
                                    <div className="flex justify-between">
                                      <label className="block text-gray-700">
                                        Item {iIndex + 1}
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newContent = [...blogContent];
                                          newContent[index].content.splice(
                                            iIndex,
                                            1
                                          );
                                          setBlogContent(newContent);
                                        }}
                                        className="text-red-500"
                                      >
                                        <Trash2 />
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      value={item.title}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].content[
                                          iIndex
                                        ].title = e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder="Title"
                                      required
                                    />
                                    <input
                                      type="text"
                                      value={item.image}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].content[
                                          iIndex
                                        ].image = e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder="Image URL"
                                      required
                                    />
                                    <textarea
                                      value={item.content}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].content[
                                          iIndex
                                        ].content = e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder="Content"
                                      required
                                    />
                                    <input
                                      type="text"
                                      value={item.subtitle}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].content[
                                          iIndex
                                        ].subtitle = e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder="Subtitle"
                                      required
                                    />
                                    {item.points.map((point, pIndex) => (
                                      <div
                                        key={pIndex}
                                        className="ml-4 mt-2 flex items-center gap-2"
                                      >
                                        <input
                                          type="text"
                                          value={point}
                                          onChange={(e) => {
                                            const newContent = [...blogContent];
                                            newContent[index].content[
                                              iIndex
                                            ].points[pIndex] = e.target.value;
                                            setBlogContent(newContent);
                                          }}
                                          className="w-full p-2 border border-gray-300 rounded mt-1"
                                          placeholder={`Point ${pIndex + 1}`}
                                          required
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newContent = [...blogContent];
                                            newContent[index].content[
                                              iIndex
                                            ].points.splice(pIndex, 1);
                                            setBlogContent(newContent);
                                          }}
                                          className="text-red-500"
                                        >
                                          <Trash2 />
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newContent = [...blogContent];
                                        newContent[index].content[
                                          iIndex
                                        ].points.push("");
                                        setBlogContent(newContent);
                                      }}
                                      className="text-blue-500 mt-2 ml-4"
                                    >
                                      Add Point
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newContent = [...blogContent];
                                    newContent[index].content.push({
                                      title: "",
                                      image: "",
                                      content: "",
                                      subtitle: "",
                                      points: [""],
                                    });
                                    setBlogContent(newContent);
                                  }}
                                  className="text-blue-500 mt-2"
                                >
                                  Add Item
                                </button>
                              </div>
                            )}

                            {section.type === "numbered-list" && (
                              <div>
                                {section.items.map((item, iIndex) => (
                                  <div
                                    key={iIndex}
                                    className="mb-2 flex items-center gap-2"
                                  >
                                    <input
                                      type="text"
                                      value={item}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].items[iIndex] =
                                          e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder={`Step ${iIndex + 1}`}
                                      required
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newContent = [...blogContent];
                                        newContent[index].items.splice(
                                          iIndex,
                                          1
                                        );
                                        setBlogContent(newContent);
                                      }}
                                      className="text-red-500"
                                    >
                                      <Trash2 />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newContent = [...blogContent];
                                    newContent[index].items.push("");
                                    setBlogContent(newContent);
                                  }}
                                  className="text-blue-500 mt-2"
                                >
                                  Add Item
                                </button>
                              </div>
                            )}

                            {section.type === "checklist" && (
                              <div>
                                {section.items.map((item, iIndex) => (
                                  <div
                                    key={iIndex}
                                    className="mb-2 flex items-center gap-2"
                                  >
                                    <input
                                      type="text"
                                      value={item}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].items[iIndex] =
                                          e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder={`Item ${iIndex + 1}`}
                                      required
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newContent = [...blogContent];
                                        newContent[index].items.splice(
                                          iIndex,
                                          1
                                        );
                                        setBlogContent(newContent);
                                      }}
                                      className="text-red-500"
                                    >
                                      <Trash2 />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newContent = [...blogContent];
                                    newContent[index].items.push("");
                                    setBlogContent(newContent);
                                  }}
                                  className="text-blue-500 mt-2"
                                >
                                  Add Item
                                </button>
                              </div>
                            )}

                            {section.type === "faq" && (
                              <div>
                                {section.items.map((item, iIndex) => (
                                  <div
                                    key={iIndex}
                                    className="mb-4 border p-2 rounded"
                                  >
                                    <div className="flex justify-between">
                                      <label className="block text-gray-700">
                                        FAQ {iIndex + 1}
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newContent = [...blogContent];
                                          newContent[index].items.splice(
                                            iIndex,
                                            1
                                          );
                                          setBlogContent(newContent);
                                        }}
                                        className="text-red-500"
                                      >
                                        <Trash2 />
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      value={item.question}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].items[
                                          iIndex
                                        ].question = e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder="Question"
                                      required
                                    />
                                    <textarea
                                      value={item.answer}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].items[iIndex].answer =
                                          e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder="Answer"
                                      required
                                    />
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newContent = [...blogContent];
                                    newContent[index].items.push({
                                      question: "",
                                      answer: "",
                                    });
                                    setBlogContent(newContent);
                                  }}
                                  className="text-blue-500 mt-2"
                                >
                                  Add FAQ
                                </button>
                              </div>
                            )}

                            {section.type === "highlight-list" && (
                              <div>
                                {section.items.map((item, iIndex) => (
                                  <div
                                    key={iIndex}
                                    className="mb-4 border p-2 rounded"
                                  >
                                    <div className="flex justify-between">
                                      <label className="block text-gray-700">
                                        Item {iIndex + 1}
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newContent = [...blogContent];
                                          newContent[index].items.splice(
                                            iIndex,
                                            1
                                          );
                                          setBlogContent(newContent);
                                        }}
                                        className="text-red-500"
                                      >
                                        <Trash2 />
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      value={item.title}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].items[iIndex].title =
                                          e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder="Title"
                                      required
                                    />
                                    <textarea
                                      value={item.content}
                                      onChange={(e) => {
                                        const newContent = [...blogContent];
                                        newContent[index].items[
                                          iIndex
                                        ].content = e.target.value;
                                        setBlogContent(newContent);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded mt-1"
                                      placeholder="Content"
                                      required
                                    />
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newContent = [...blogContent];
                                    newContent[index].items.push({
                                      title: "",
                                      content: "",
                                    });
                                    setBlogContent(newContent);
                                  }}
                                  className="text-blue-500 mt-2"
                                >
                                  Add Item
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex gap-2 justify-center items-center">
                            <label className="block text-gray-700">
                              Insert at Index
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={blogContent.length}
                              value={insertIndex}
                              onChange={(e) =>
                                setInsertIndex(parseInt(e.target.value) || 0)
                              }
                              className="w-20 p-2 border border-gray-300 rounded mt-1"
                              placeholder={`0-${blogContent.length}`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newContent = [...blogContent];
                              newContent.splice(insertIndex, 0, {
                                type: "title",
                                content: "",
                              });
                              setBlogContent(newContent);
                              setInsertIndex(blogContent.length);
                            }}
                            className="text-blue-500"
                          >
                            Add Section
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-4">
                        <button
                          type="submit"
                          className="bg-blue-500 text-white p-2 rounded w-full"
                          disabled={loading}
                        >
                          {loading
                            ? displayIndex === 6
                              ? "Adding..."
                              : "Updating..."
                            : displayIndex === 6
                            ? "Add Blog Post"
                            : "Update Blog"}
                        </button>
                        {displayIndex === 7 && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBlog(null);
                              setBlogTitle("");
                              setBlogMetaTitle("");
                              setBlogMetaDescription("");
                              setBlogImage("");
                              setBlogSlug("");
                              setBlogType(1);
                              setBlogContent([{ type: "title", content: "" }]);
                            }}
                            className="bg-gray-500 text-white p-2 rounded w-full"
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div>
                      {allBlogs.length > 0 ? (
                        allBlogs.map((blog) => (
                          <div
                            key={blog._id}
                            className="p-4 border-b border-gray-300 flex flex-col gap-2"
                          >
                            <div className="w-full flex justify-between items-center">
                              <h3 className="text-lg font-semibold">
                                {blog.title}
                              </h3>
                              <div className="flex gap-4">
                                <button
                                  onClick={() => {
                                    setEditingBlog(blog);
                                    setBlogTitle(blog.title);
                                    setBlogMetaTitle(blog.metaTitle);
                                    setBlogMetaDescription(
                                      blog.metaDescription
                                    );
                                    setBlogImage(blog.image);
                                    setBlogSlug(blog.slug);
                                    setBlogType(blog.type);
                                    setBlogContent(blog.content);
                                  }}
                                  className="text-blue-500"
                                >
                                  <Pencil />
                                </button>
                                <button
                                  onClick={() => setDeletingBlog(blog)}
                                  className="text-red-500"
                                  disabled={loading}
                                >
                                  <Trash2 />
                                </button>
                              </div>
                            </div>
                            {deletingBlog &&
                              deletingBlog.title === blog.title && (
                                <div className="mt-4 p-4 self-end border border-red-300 rounded">
                                  <p>
                                    Are you sure you want to delete "
                                    {deletingBlog.title}"?
                                  </p>
                                  <div className="flex gap-4 mt-2">
                                    <button
                                      onClick={() =>
                                        handleDeleteBlog(deletingBlog.slug)
                                      }
                                      className="bg-red-500 text-white px-4 py-2 rounded"
                                      disabled={loading}
                                    >
                                      {loading
                                        ? "Deleting..."
                                        : "Confirm Delete"}
                                    </button>
                                    <button
                                      onClick={() => setDeletingBlog(null)}
                                      className="bg-gray-500 text-white px-4 py-2 rounded"
                                      disabled={loading}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                          </div>
                        ))
                      ) : (
                        <p className="w-full text-center">
                          No blogs available.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : displayIndex === 6 ? (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Add New Blog Post</h2>
                  <form
                    onSubmit={
                      displayIndex === 6 ? handleAddBlog : handleUpdateBlog
                    }
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-gray-700">Title</label>
                      <input
                        type="text"
                        value={blogTitle}
                        onChange={(e) => setBlogTitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700">Meta Title</label>
                      <input
                        type="text"
                        value={blogMetaTitle}
                        onChange={(e) => setBlogMetaTitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700">
                        Meta Description
                      </label>
                      <textarea
                        value={blogMetaDescription}
                        onChange={(e) => setBlogMetaDescription(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700">Image</label>
                      <input
                        type="text"
                        value={blogImage}
                        onChange={(e) => setBlogImage(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700">Slug</label>
                      <input
                        type="text"
                        value={blogSlug}
                        onChange={(e) => setBlogSlug(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700">Type</label>
                      <select
                        value={blogType}
                        onChange={(e) => setBlogType(parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                      >
                        {typesOfBlogs.map((type, index) => (
                          <option key={index} value={index + 1}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Content Sections
                      </label>
                      {blogContent.map((section, index) => (
                        <div key={index} className="border p-4 mb-4 rounded">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">
                              Section {index + 1}
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                const newContent = [...blogContent];
                                newContent.splice(index, 1);
                                setBlogContent(newContent);
                              }}
                              className="text-red-500"
                            >
                              <Trash2 />
                            </button>
                          </div>
                          <div className="mb-2">
                            <label className="block text-gray-700">
                              Section Type
                            </label>
                            <select
                              value={section.type}
                              onChange={(e) => {
                                const newContent = [...blogContent];
                                newContent[index].type = e.target.value;
                                if (e.target.value === "table") {
                                  newContent[index] = {
                                    type: "table",
                                    headers: ["Column 1"],
                                    rows: [[""]],
                                  };
                                } else if (
                                  e.target.value === "title" ||
                                  e.target.value === "subtitle" ||
                                  e.target.value === "subtitle1" ||
                                  e.target.value === "para" ||
                                  e.target.value === "summary"
                                ) {
                                  newContent[index] = {
                                    type: e.target.value,
                                    content: "",
                                  };
                                } else if (e.target.value === "image") {
                                  newContent[index] = {
                                    type: "image",
                                    content: "",
                                    image: "",
                                    alt: "",
                                  };
                                } else if (e.target.value === "points") {
                                  newContent[index] = {
                                    type: "points",
                                    points: [{ title: "", content: "" }],
                                  };
                                } else if (e.target.value === "points-points") {
                                  newContent[index] = {
                                    type: "points-points",
                                    content: [
                                      {
                                        title: "",
                                        content: "",
                                        subtitle: "",
                                        points: [""],
                                      },
                                    ],
                                  };
                                } else if (
                                  e.target.value === "points-points-with-image"
                                ) {
                                  newContent[index] = {
                                    type: "points-points-with-image",
                                    content: [
                                      {
                                        title: "",
                                        image: "",
                                        content: "",
                                        subtitle: "",
                                        points: [""],
                                      },
                                    ],
                                  };
                                } else if (
                                  e.target.value === "numbered-list" ||
                                  e.target.value === "checklist"
                                ) {
                                  newContent[index] = {
                                    type: e.target.value,
                                    items: [""],
                                  };
                                } else if (e.target.value === "faq") {
                                  newContent[index] = {
                                    type: "faq",
                                    items: [{ question: "", answer: "" }],
                                  };
                                } else if (
                                  e.target.value === "highlight-list"
                                ) {
                                  newContent[index] = {
                                    type: "highlight-list",
                                    items: [{ title: "", content: "" }],
                                  };
                                } else if (e.target.value === "cta") {
                                  newContent[index] = {
                                    type: "cta",
                                    content: "",
                                    buttonText: "",
                                    link: "",
                                    content2: "",
                                  };
                                }
                                setBlogContent(newContent);
                              }}
                              className="w-full p-2 border border-gray-300 rounded mt-1"
                            >
                              <option value="title">Title</option>
                              <option value="subtitle">Subtitle</option>
                              <option value="subtitle1">Subtitle1</option>
                              <option value="para">Paragraph</option>
                              <option value="image">Image</option>
                              <option value="points">Points</option>
                              <option value="points-points">
                                Points-Points
                              </option>
                              <option value="points-points-with-image">
                                Points-Points with Image
                              </option>
                              <option value="numbered-list">
                                Numbered List
                              </option>
                              <option value="summary">Summary</option>
                              <option value="faq">FAQ</option>
                              <option value="checklist">Checklist</option>
                              <option value="highlight-list">
                                Highlight List
                              </option>
                              <option value="table">Table</option>
                              <option value="cta">Call to Action</option>
                            </select>
                          </div>

                          {section.type === "cta" && (
                            <>
                              <div>
                                <label className="block text-gray-700">
                                  Content
                                </label>
                                <input
                                  type="text"
                                  value={section.content}
                                  onChange={(e) => {
                                    const newContent = [...blogContent];
                                    newContent[index].content = e.target.value;
                                    setBlogContent(newContent);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded mt-1"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700">
                                  Button Text
                                </label>
                                <input
                                  type="text"
                                  value={section.buttonText}
                                  onChange={(e) => {
                                    const newContent = [...blogContent];
                                    newContent[index].buttonText =
                                      e.target.value;
                                    setBlogContent(newContent);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded mt-1"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700">
                                  Link
                                </label>
                                <input
                                  type="text"
                                  value={section.link}
                                  onChange={(e) => {
                                    const newContent = [...blogContent];
                                    newContent[index].link = e.target.value;
                                    setBlogContent(newContent);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded mt-1"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700">
                                  Additional Content
                                </label>
                                <input
                                  type="text"
                                  value={section.content2}
                                  onChange={(e) => {
                                    const newContent = [...blogContent];
                                    newContent[index].content2 = e.target.value;
                                    setBlogContent(newContent);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                              </div>
                            </>
                          )}

                          {(section.type === "title" ||
                            section.type === "subtitle" ||
                            section.type === "subtitle1" ||
                            section.type === "para" ||
                            section.type === "summary") && (
                            <div>
                              <label className="block text-gray-700">
                                Content
                              </label>
                              <input
                                type="text"
                                value={section.content}
                                onChange={(e) => {
                                  const newContent = [...blogContent];
                                  newContent[index].content = e.target.value;
                                  setBlogContent(newContent);
                                }}
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                                required
                              />
                            </div>
                          )}

                          {section.type === "image" && (
                            <>
                              <div>
                                <label className="block text-gray-700">
                                  Caption
                                </label>
                                <input
                                  type="text"
                                  value={section.content}
                                  onChange={(e) => {
                                    const newContent = [...blogContent];
                                    newContent[index].content = e.target.value;
                                    setBlogContent(newContent);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded mt-1"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700">
                                  Image URL
                                </label>
                                <input
                                  type="text"
                                  value={section.image}
                                  onChange={(e) => {
                                    const newContent = [...blogContent];
                                    newContent[index].image = e.target.value;
                                    setBlogContent(newContent);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded mt-1"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700">
                                  Alt Text
                                </label>
                                <input
                                  type="text"
                                  value={section.alt}
                                  onChange={(e) => {
                                    const newContent = [...blogContent];
                                    newContent[index].alt = e.target.value;
                                    setBlogContent(newContent);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                              </div>
                            </>
                          )}

                          {section.type === "table" && (
                            <div>
                              <div className="mb-4 flex gap-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleBlogTableAddColumn(index)
                                  }
                                  className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                  Add Column
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleBlogTableAddRow(index)}
                                  className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                  Add Row
                                </button>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                  <thead>
                                    <tr>
                                      {section.headers.map(
                                        (header, colIndex) => (
                                          <th
                                            key={colIndex}
                                            className="border border-gray-300 p-2"
                                          >
                                            <input
                                              type="text"
                                              value={header}
                                              onChange={(e) =>
                                                handleBlogTableHeaderChange(
                                                  index,
                                                  colIndex,
                                                  e.target.value
                                                )
                                              }
                                              className="w-full p-1 border-none focus:outline-none"
                                            />
                                          </th>
                                        )
                                      )}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {section.rows.map((row, rowIndex) => (
                                      <tr key={rowIndex}>
                                        {row.map((cell, colIndex) => (
                                          <td
                                            key={colIndex}
                                            className="border border-gray-300 p-2"
                                          >
                                            <input
                                              type="text"
                                              value={cell}
                                              onChange={(e) =>
                                                handleBlogTableCellChange(
                                                  index,
                                                  rowIndex,
                                                  colIndex,
                                                  e.target.value
                                                )
                                              }
                                              className="w-full p-1 border-none focus:outline-none"
                                            />
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {section.type === "points" && (
                            <div>
                              {section.points.map((point, pIndex) => (
                                <div
                                  key={pIndex}
                                  className="mb-2 flex flex-col gap-2"
                                >
                                  <label className="block text-gray-700">
                                    Point {pIndex + 1}
                                  </label>
                                  <input
                                    type="text"
                                    value={point.title}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].points[pIndex].title =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder="Title"
                                    required
                                  />
                                  <textarea
                                    value={point.content}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].points[pIndex].content =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder="Content"
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newContent = [...blogContent];
                                      newContent[index].points.splice(
                                        pIndex,
                                        1
                                      );
                                      setBlogContent(newContent);
                                    }}
                                    className="text-red-500 mt-2"
                                  >
                                    <Trash2 />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const newContent = [...blogContent];
                                  newContent[index].points.push({
                                    title: "",
                                    content: "",
                                  });
                                  setBlogContent(newContent);
                                }}
                                className="text-blue-500 mt-2"
                              >
                                Add Point
                              </button>
                            </div>
                          )}

                          {section.type === "points-points" && (
                            <div>
                              {section.content.map((item, iIndex) => (
                                <div
                                  key={iIndex}
                                  className="mb-4 border p-2 rounded"
                                >
                                  <div className="flex justify-between">
                                    <label className="block text-gray-700">
                                      Item {iIndex + 1}
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newContent = [...blogContent];
                                        newContent[index].content.splice(
                                          iIndex,
                                          1
                                        );
                                        setBlogContent(newContent);
                                      }}
                                      className="text-red-500"
                                    >
                                      <Trash2 />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].content[iIndex].title =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder="Title"
                                    required
                                  />
                                  <textarea
                                    value={item.content}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].content[
                                        iIndex
                                      ].content = e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder="Content"
                                    required
                                  />
                                  <input
                                    type="text"
                                    value={item.subtitle}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].content[
                                        iIndex
                                      ].subtitle = e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder="Subtitle"
                                    required
                                  />
                                  {item.points.map((point, pIndex) => (
                                    <div
                                      key={pIndex}
                                      className="ml-4 mt-2 flex items-center gap-2"
                                    >
                                      <input
                                        type="text"
                                        value={point}
                                        onChange={(e) => {
                                          const newContent = [...blogContent];
                                          newContent[index].content[
                                            iIndex
                                          ].points[pIndex] = e.target.value;
                                          setBlogContent(newContent);
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded mt-1"
                                        placeholder={`Point ${pIndex + 1}`}
                                        required
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newContent = [...blogContent];
                                          newContent[index].content[
                                            iIndex
                                          ].points.splice(pIndex, 1);
                                          setBlogContent(newContent);
                                        }}
                                        className="text-red-500"
                                      >
                                        <Trash2 />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newContent = [...blogContent];
                                      newContent[index].content[
                                        iIndex
                                      ].points.push("");
                                      setBlogContent(newContent);
                                    }}
                                    className="text-blue-500 mt-2 ml-4"
                                  >
                                    Add Point
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const newContent = [...blogContent];
                                  newContent[index].content.push({
                                    title: "",
                                    content: "",
                                    subtitle: "",
                                    points: [""],
                                  });
                                  setBlogContent(newContent);
                                }}
                                className="text-blue-500 mt-2"
                              >
                                Add Item
                              </button>
                            </div>
                          )}

                          {section.type === "points-points-with-image" && (
                            <div>
                              {section.content.map((item, iIndex) => (
                                <div
                                  key={iIndex}
                                  className="mb-4 border p-2 rounded"
                                >
                                  <div className="flex justify-between">
                                    <label className="block text-gray-700">
                                      Item {iIndex + 1}
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newContent = [...blogContent];
                                        newContent[index].content.splice(
                                          iIndex,
                                          1
                                        );
                                        setBlogContent(newContent);
                                      }}
                                      className="text-red-500"
                                    >
                                      <Trash2 />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].content[iIndex].title =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder="Title"
                                    required
                                  />
                                  <input
                                    type="text"
                                    value={item.image}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].content[iIndex].image =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder="Image URL"
                                    required
                                  />
                                  <textarea
                                    value={item.content}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].content[
                                        iIndex
                                      ].content = e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder="Content"
                                    required
                                  />
                                  <input
                                    type="text"
                                    value={item.subtitle}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].content[
                                        iIndex
                                      ].subtitle = e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder="Subtitle"
                                    required
                                  />
                                  {item.points.map((point, pIndex) => (
                                    <div
                                      key={pIndex}
                                      className="ml-4 mt-2 flex items-center gap-2"
                                    >
                                      <input
                                        type="text"
                                        value={point}
                                        onChange={(e) => {
                                          const newContent = [...blogContent];
                                          newContent[index].content[
                                            iIndex
                                          ].points[pIndex] = e.target.value;
                                          setBlogContent(newContent);
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded mt-1"
                                        placeholder={`Point ${pIndex + 1}`}
                                        required
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newContent = [...blogContent];
                                          newContent[index].content[
                                            iIndex
                                          ].points.splice(pIndex, 1);
                                          setBlogContent(newContent);
                                        }}
                                        className="text-red-500"
                                      >
                                        <Trash2 />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newContent = [...blogContent];
                                      newContent[index].content[
                                        iIndex
                                      ].points.push("");
                                      setBlogContent(newContent);
                                    }}
                                    className="text-blue-500 mt-2 ml-4"
                                  >
                                    Add Point
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const newContent = [...blogContent];
                                  newContent[index].content.push({
                                    title: "",
                                    image: "",
                                    content: "",
                                    subtitle: "",
                                    points: [""],
                                  });
                                  setBlogContent(newContent);
                                }}
                                className="text-blue-500 mt-2"
                              >
                                Add Item
                              </button>
                            </div>
                          )}

                          {section.type === "numbered-list" && (
                            <div>
                              {section.items.map((item, iIndex) => (
                                <div
                                  key={iIndex}
                                  className="mb-2 flex items-center gap-2"
                                >
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].items[iIndex] =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder={`Step ${iIndex + 1}`}
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newContent = [...blogContent];
                                      newContent[index].items.splice(iIndex, 1);
                                      setBlogContent(newContent);
                                    }}
                                    className="text-red-500"
                                  >
                                    <Trash2 />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const newContent = [...blogContent];
                                  newContent[index].items.push("");
                                  setBlogContent(newContent);
                                }}
                                className="text-blue-500 mt-2"
                              >
                                Add Item
                              </button>
                            </div>
                          )}

                          {section.type === "checklist" && (
                            <div>
                              {section.items.map((item, iIndex) => (
                                <div
                                  key={iIndex}
                                  className="mb-2 flex items-center gap-2"
                                >
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].items[iIndex] =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder={`Item ${iIndex + 1}`}
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newContent = [...blogContent];
                                      newContent[index].items.splice(iIndex, 1);
                                      setBlogContent(newContent);
                                    }}
                                    className="text-red-500"
                                  >
                                    <Trash2 />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const newContent = [...blogContent];
                                  newContent[index].items.push("");
                                  setBlogContent(newContent);
                                }}
                                className="text-blue-500 mt-2"
                              >
                                Add Item
                              </button>
                            </div>
                          )}

                          {section.type === "faq" && (
                            <div>
                              {section.items.map((item, iIndex) => (
                                <div
                                  key={iIndex}
                                  className="mb-4 border p-2 rounded"
                                >
                                  <div className="flex justify-between">
                                    <label className="block text-gray-700">
                                      FAQ {iIndex + 1}
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newContent = [...blogContent];
                                        newContent[index].items.splice(
                                          iIndex,
                                          1
                                        );
                                        setBlogContent(newContent);
                                      }}
                                      className="text-red-500"
                                    >
                                      <Trash2 />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={item.question}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].items[iIndex].question =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder="Question"
                                    required
                                  />
                                  <textarea
                                    value={item.answer}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].items[iIndex].answer =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder="Answer"
                                    required
                                  />
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const newContent = [...blogContent];
                                  newContent[index].items.push({
                                    question: "",
                                    answer: "",
                                  });
                                  setBlogContent(newContent);
                                }}
                                className="text-blue-500 mt-2"
                              >
                                Add FAQ
                              </button>
                            </div>
                          )}
                          {section.type === "highlight-list" && (
                            <div>
                              {section.items.map((item, iIndex) => (
                                <div
                                  key={iIndex}
                                  className="mb-4 border p-2 rounded"
                                >
                                  <div className="flex justify-between">
                                    <label className="block text-gray-700">
                                      Item {iIndex + 1}
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newContent = [...blogContent];
                                        newContent[index].items.splice(
                                          iIndex,
                                          1
                                        );
                                        setBlogContent(newContent);
                                      }}
                                      className="text-red-500"
                                    >
                                      <Trash2 />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].items[iIndex].title =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder="Title"
                                    required
                                  />
                                  <textarea
                                    value={item.content}
                                    onChange={(e) => {
                                      const newContent = [...blogContent];
                                      newContent[index].items[iIndex].content =
                                        e.target.value;
                                      setBlogContent(newContent);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                    placeholder="Content"
                                    required
                                  />
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const newContent = [...blogContent];
                                  newContent[index].items.push({
                                    title: "",
                                    content: "",
                                  });
                                  setBlogContent(newContent);
                                }}
                                className="text-blue-500 mt-2"
                              >
                                Add Item
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex gap-2 justify-center items-center">
                          <label className="block text-gray-700">
                            Insert at Index
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={blogContent.length}
                            value={insertIndex}
                            onChange={(e) =>
                              setInsertIndex(parseInt(e.target.value) || 0)
                            }
                            className="w-20 p-2 border border-gray-300 rounded mt-1"
                            placeholder={`0-${blogContent.length}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newContent = [...blogContent];
                            newContent.splice(insertIndex, 0, {
                              type: "title",
                              content: "",
                            });
                            setBlogContent(newContent);
                            setInsertIndex(blogContent.length);
                          }}
                          className="text-blue-500"
                        >
                          Add Section
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded w-full"
                        disabled={loading}
                      >
                        {loading
                          ? displayIndex === 6
                            ? "Adding..."
                            : "Updating..."
                          : displayIndex === 6
                          ? "Add Blog Post"
                          : "Update Blog"}
                      </button>
                      {displayIndex === 7 && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBlog(null);
                            setBlogTitle("");
                            setBlogImage("");
                            setBlogSlug("");
                            setBlogType(1);
                            setBlogContent([{ type: "title", content: "" }]);
                          }}
                          className="bg-gray-500 text-white p-2 rounded w-full"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              ) : displayData.length > 0 ? (
                displayData.map((item, index) => (
                  <div key={index} className="p-4 border-b border-gray-300">
                    {displayIndex != 3 && displayIndex != 4 && (
                      <h2 className="font-semibold text-xl">{item.name}</h2>
                    )}
                    <div className="mt-2">
                      {displayIndex != 3 &&
                        displayIndex != 4 &&
                        displayIndex != 5 && (
                          <p>
                            <span className="font-semibold">
                              Date of Birth:{" "}
                            </span>
                            {item.dob} {item.time}:00
                          </p>
                        )}
                      {displayIndex != 3 &&
                        displayIndex != 4 &&
                        displayIndex != 5 && (
                          <p>
                            <span className="font-semibold">
                              Place of Birth:{" "}
                            </span>
                            {item.place}
                          </p>
                        )}
                      {displayIndex != 3 &&
                        displayIndex != 4 &&
                        displayIndex != 5 && (
                          <p>
                            <span className="font-semibold">Gender: </span>
                            {item.gender}
                          </p>
                        )}
                      {displayIndex == 0 && (
                        <p>
                          <span className="font-semibold">lat & lon: </span>
                          {item.lat} & {item.lon}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Email: </span>
                        {item.email}
                      </p>
                      {displayIndex != 5 && (
                        <p>
                          <span className="font-semibold">Number: </span>
                          {item.number}
                        </p>
                      )}
                      {displayIndex == 5 && (
                        <p>
                          <span className="font-semibold">Type: </span>
                          {item.type}
                        </p>
                      )}
                      {(displayIndex == 0 || displayIndex == 1) && (
                        <p>
                          <span className="font-semibold">Plan: </span>
                          {item.plan}
                        </p>
                      )}
                      {displayIndex == 4 && (
                        <p>
                          <span className="font-semibold">Age: </span>
                          {item.age}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Created At: </span>
                        {foramtDate(new Date(item.createdAt))}
                      </p>
                      {displayIndex !== 2 &&
                        displayIndex !== 3 &&
                        displayIndex !== 4 &&
                        displayIndex != 5 && (
                          <>
                            <p>
                              <span className="font-semibold">
                                Data Changes:{" "}
                              </span>
                              {item?.changes.toString()}
                            </p>
                            <p>
                              <span className="font-semibold">Order Id: </span>
                              {item.orderId}
                            </p>
                            <p>
                              <span className="font-semibold">Process: </span>
                              {processState(item.createdAt, item.changes)}
                            </p>
                          </>
                        )}
                      {displayIndex == 0 && (
                        <div>
                          <div className="mt-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                disabled={loading}
                                checked={item.isChecked}
                                onChange={() =>
                                  handleCheckboxChange(item.email, item.orderId)
                                }
                                className="form-checkbox"
                              />
                              <span className="text-sm">Mark as checked</span>
                            </label>
                            {loading ? (
                              <div>loading...</div>
                            ) : (
                              confirming.email == item.email &&
                              confirming.orderId == item.orderId && (
                                <div className="mt-2">
                                  <button
                                    onClick={() =>
                                      handleConfirm(
                                        confirming.email,
                                        confirming.orderId
                                      )
                                    }
                                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={handleCancel}
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                          <div className="mt-5">
                            <button
                              className="py-2 px-4 border border-black rounded-xl"
                              onClick={() => HandleReport(item)}
                              disabled={loading}
                            >
                              {loading ? "Loading.." : "Generate Report"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="w-full text-center">
                  No child details available.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-screen h-screen flex justify-center text-black items-center">
          <form
            onSubmit={adminLogin}
            className="bg-white px-12 py-5 rounded shadow-lg"
          >
            <h2 className="text-2xl mb-4 text-center">Admin Login</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded mt-4"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;
