import React, { useState, useEffect, useContext, useRef } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { FaVideo } from "react-icons/fa";
import { IoMdClose, IoMdRefresh } from "react-icons/io";
import { AiFillStar, AiOutlineClockCircle } from "react-icons/ai";
import { TbPointFilled } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import Modal from "@mui/material/Modal";
import { Alert, CircularProgress } from "@mui/material";
import useDocTitle from "../hooks/useDocTitle";
import useActive from "../hooks/useActive";
import Preloader from "../components/common/Preloader";
import commonContext from "../contexts/common/commonContext";
import useScrollDisable from "../hooks/useScrollDisable";
import httpClient from "../httpClient";
import useOutsideClose from "../hooks/useOutsideClose";

const Doctors = () => {
  useDocTitle("Doctors");
  const { isLoading, toggleLoading } = useContext(commonContext);
  const navigate = useNavigate();

  const [meetModal, setMeetModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [isInstantMeet, setInstantMeet] = useState(false);
  const [isConnecting, setConnecting] = useState(false);
  const [isScheduleMeet, setScheduleMeet] = useState(false);
  const [isInvDateTime, setInvDateTime] = useState(false);
  const [scheduleAlert, setScheduleAlert] = useState(0);
  const [meetScheduling, setMeetScheduling] = useState(false);
  const [curDate, setCurDate] = useState(null);
  const [curTime, setCurTime] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [balance, setBalance] = useState(0);
  const [isLowBalance, setLowBalance] = useState(false);
  const [curFee, setCurFee] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [selectedDocStatus, setSelectedDocStatus] = useState(false);
  const [selectedDocAvailable, setSelectedDocAvailable] = useState(false);
  const [selectEmail, setSelectEmail] = useState("");
  const [message, setMessage] = useState("");
  const { handleActive, activeClass } = useActive(-1);
  const [selectedTime, setSelectedTime] = useState(null);
  const modalRef = useRef(null);

  const [available, setAvailable] = useState([
    { time: "08:00", available: true },
    { time: "09:00", available: true },
    { time: "10:00", available: true },
    { time: "11:00", available: true },
    { time: "12:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
    { time: "17:00", available: true },
    { time: "18:00", available: true },
  ]);

  const timings = Object.entries(available).map(([time, isAvailable]) => ({
    time,
    available: true,
  }));

  useEffect(() => {
    const userNotExists = !localStorage.getItem("usertype");
    if (userNotExists) {
      navigate("/");
    } else {
      fetchDoctors();
    }
  }, []);

  useEffect(() => {
    handleTimings();
  }, [isScheduleMeet, curDate]);

  useEffect(() => {
    httpClient
      .post("/get_wallet", {
        email: localStorage.getItem("email"),
      })
      .then((res) => {
        setBalance(res.data.wallet);
      })
      .catch(console.error);
  }, []);

  useOutsideClose(modalRef, () => {
    setMessage("");
    setMeetModal(false);
    setConnecting(false);
    httpClient.put("/delete_meet", { email: selectEmail });
  });

  const fetchDoctors = () => {
    setFetchingData(true);
    toggleLoading(true);
    httpClient
      .get("/get_status")
      .then((res) => {
        setDoctors(res.data.details);
        toggleLoading(false);
        setFetchingData(false);
      })
      .catch(() => {
        toggleLoading(false);
        setFetchingData(false);
      });
  };

  const handleMeet = () => {
    const time = new Date().getTime();
    httpClient.post("/meet_status", { email: selectEmail }).then((res) => {
      if (res.status === 200) {
        const meetLink = `/instant-meet?meetId=${time}&selectedDoc=${selectedDoc}&selectedMail=${encodeURIComponent(
          selectEmail
        )}&name=${localStorage.getItem("username")}&age=${localStorage.getItem(
          "age"
        )}&gender=${localStorage.getItem(
          "gender"
        )}&pemail=${localStorage.getItem("email")}&fee=${curFee}`;

        httpClient
          .put("/make_meet", {
            email: selectEmail,
            link: meetLink,
            patient: localStorage.getItem("username"),
          })
          .then(() => {
            setTimeout(() => {
              httpClient
                .post("/currently_in_meet", { email: selectEmail })
                .then((res) => {
                  if (res.data.curmeet) {
                    setConnecting(false);
                    navigate(meetLink);
                  } else {
                    httpClient.put("/delete_meet", { email: selectEmail });
                    setConnecting(false);
                    setMessage(res.data.message);
                  }
                });
            }, 20000);
          });
      } else {
        setConnecting(false);
        setMessage(res.data.message);
      }
    });
  };

  const handleTimings = () => {
    if (!selectEmail) return;

    httpClient
      .post("/doctor_apo", { demail: selectEmail })
      .then((res) => {
        const appointments = res.data.upcomingAppointments;
        let times = {
          "08:00": true,
          "09:00": true,
          "10:00": true,
          "11:00": true,
          "12:00": true,
          "15:00": true,
          "16:00": true,
          "17:00": true,
          "18:00": true,
        };
        appointments
          .filter((item) => {
            const itemDate = item.date.split("T")[0]; // Extract YYYY-MM-DD
            const selectedDate = curDate.split("T")[0]; // Ensure same format
            return itemDate === selectedDate;
          })
          .forEach((item) => {
            times[item.time] = false;
          });
        setAvailable(times);
      })
      .catch(console.error);
  };

  const handleScheduleClick = () => {
    setMeetScheduling(true);
    setTimeout(() => {
      setMeetScheduling(false);
      httpClient
        .post("/doctor_apo", {
          demail: selectEmail,
        })
        .then((res) => {
          if (handleSchedule(res.data.upcomingAppointments)) {
            setScheduleAlert(2);
            const datetime = `${curDate}${curTime.replace(":", "")}`;
            const link = `/instant-meet?meetId=${datetime}&selectedDoc=${selectedDoc}&selectedMail=${encodeURIComponent(
              selectEmail
            )}&name=${localStorage.getItem(
              "username"
            )}&age=${localStorage.getItem("age")}&gender=${localStorage.getItem(
              "gender"
            )}&pemail=${localStorage.getItem("email")}fee=${curFee}`;
            httpClient
              .put("/patient_apo", {
                email: localStorage.getItem("email"),
                date: curDate,
                time: curTime,
                doctor: selectedDoc,
                demail: selectEmail,
                link: link,
              })
              .then((res) => {
                console.log(res);
              })
              .catch((err) => {
                console.log(err);
              });

            httpClient
              .put("/doctor_apo", {
                demail: selectEmail,
                date: curDate,
                time: curTime,
                patient: localStorage.getItem("username"),
                pemail: localStorage.getItem("email"),
                link: link,
              })
              .then((res) => {
                console.log(res);
              })
              .catch((err) => {
                console.log(err);
              });

            httpClient
              .put("/set_appointment", {
                pemail: localStorage.getItem("email"),
                date: curDate,
                time: curTime,
                doctor: selectedDoc,
                demail: selectEmail,
                link: link,
              })
              .then((res) => {
                console.log(res);
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            setScheduleAlert(1);
          }
        })
        .catch((err) => {
          console.log(err);
        });

      setTimeout(() => {
        setScheduleAlert(0);
        setMeetModal(false);
      }, 4000);
    }, 2000);
  };

  const columns = [
    {
      field: "id",
      headerName: "#",
      width: 80,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "username",
      headerName: "Doctor",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className="text-gray-800">
          {`Dr. ${params.row.username
            .split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ")}`}
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "specialization",
      headerName: "Specialization",
      width: 150,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "fee",
      headerName: "Fee",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <div>₹ {params.row.fee}</div>,
    },
    {
      field: "languages",
      headerName: "Languages",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: () => "English / Hindi",
    },
    {
      field: "ratings",
      headerName: "Ratings",
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-1">
          <span>
            {params.row.noOfAppointments
              ? (params.row.noOfStars / params.row.noOfAppointments).toFixed(1)
              : "0"}
          </span>
          <AiFillStar className="text-yellow-400" />
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-1">
          <TbPointFilled
            className={
              params.row.status === "online" ? "text-green-400" : "text-red-400"
            }
          />
          <span className="font-medium">{params.row.status}</span>
        </div>
      ),
    },
    {
      field: "appointments",
      headerName: "Book an Appointment",
      width: 180,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <button
          onClick={() => {
            if (params.row.fee > balance) {
              setLowBalance(true);
              setCurFee(params.row.fee);
            } else {
              setSelectEmail(params.row.email);
              setSelectedDocStatus(params.row.status === "online");
              setSelectedDocAvailable(params.row.isInMeet);
              setScheduleMeet(false);
              setInstantMeet(false);
              setLowBalance(false);
            }
            setSelectedDoc(
              `Dr. ${params.row.username
                .split(" ")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" ")}`
            );
            setMeetModal(true);
          }}
          className="px-4 py-2 bg-blue-3 text-white-1 rounded hover:bg-blue-7 
  transition-colors duration-200"
        >
          BOOK
        </button>
      ),
    },
  ];

  useScrollDisable(isLoading);

  if (isLoading) return <Preloader />;

  const handleSchedule = (upcomingAppointments) => {
    for (let i = 0; i < upcomingAppointments.length; i++) {
      const now = new Date(curDate + " " + curTime);
      const d1 = new Date(
        new Date(
          upcomingAppointments[i].date + " " + upcomingAppointments[i].time
        ).getTime() -
          30 * 60000
      );
      const d2 = new Date(
        new Date(
          upcomingAppointments[i].date + " " + upcomingAppointments[i].time
        ).getTime() +
          30 * 60000
      );

      if (d1 < now && now <= d2) return false;
    }
    return true;
  };

  const checkInvDateTime = (date, time) => {
    if (!date || !time) {
      setInvDateTime(true);
      return;
    }

    const selectedDateTime = new Date(`${date} ${time}`);
    const currentDateTime = new Date();

    // Check if selected date and time are in the future
    const isValidDateTime = selectedDateTime > currentDateTime;
    setInvDateTime(!isValidDateTime);
  };

  return (
    <div className="py-24 text-center h-full">
      <div
        className="min-h-[600px] mx-auto text-gray-800 max-w-[1300px] w-full 
   rounded-lg h-full"
      >
        <div className="flex justify-center items-center mb-6 ">
          <h3 className="text-2xl font-semibold bg">Doctor Details</h3>
          <button
            className={`ml-2.5 p-2 rounded ${
              fetchingData
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-3 text-white-1 hover:bg-blue-7 cursor-pointer"
            } text-white transition-all duration-300`}
            onClick={fetchDoctors}
            disabled={fetchingData}
          >
            <IoMdRefresh className={fetchingData ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="w-full flex justify-center px-4">
          <DataGrid
            rows={doctors}
            columns={columns}
            components={{
              Toolbar: GridToolbar,
            }}
            sx={{
              border: "none",
              borderRadius: "0.5rem",
              maxHeight: "600px",
              height: "100vh",
              padding: "1rem",
              boxShadow: "0 0 10px 1px #b0bbd8",
              "& .MuiDataGrid-toolbarContainer": {
                backgroundColor: "",

                "& button": {
                  backgroundColor: "#7584ae",
                  color: "white",

                  "&:hover": {
                    backgroundColor: "#282f42",
                  },
                },
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#F3F4F6",
                borderBottom: "1px solid #E5E7EB",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #E5E7EB",
              },
            }}
          />
        </div>
      </div>

      {/* Low Balance Modal */}
      <Modal
        open={meetModal && isLowBalance}
        onClose={() => {
          setMessage("");
          setMeetModal(false);
        }}
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative bg-white-1"
            ref={modalRef}
          >
            <div className="justify-between items-center border-b pb-4 mb-4">
              <IoMdClose
                className="text-blue-5 hover:text-blue-8 cursor-pointer transition-colors duration-300 ease-in-out block"
                onClick={() => setMeetModal(false)}
              />
              <h3 className="text-red-600 font-semibold text-[1em] my-4">
                Insufficient Balance
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-blue-7 text-[1.3em] font-normal">
                  Doctor Fee {`(${selectedDoc})`}
                </span>
                <span className="font-bold text-blue-7 w-12">₹ {curFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-7 text-[1.3em] font-normal">
                  Available Balance
                </span>
                <span className="font-bold text-blue-7">₹ {balance}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-blue-2">
                <span className="text-red-600 font-semibold">
                  Required Amount
                </span>
                <span className="text-red-600 font-bold">
                  ₹ {curFee - balance}
                </span>
              </div>
            </div>

            <button
              className="w-full mt-6 bg-blue-5 hover:bg-blue-6 text-white-1 py-3 rounded-lg transition-colors duration-300 shadow-md"
              onClick={() =>
                navigate(`/my-wallet?recharge=${curFee - balance}`)
              }
            >
              Recharge Wallet
            </button>
          </div>
        </div>
      </Modal>

      {/* Appointment Modal */}
      <Modal
        open={meetModal && !isLowBalance}
        onClose={() => {
          setMessage("");
          setMeetModal(false);
          setConnecting(false);
        }}
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="rounded-[8px] w-auto py-[14px] px-[20px] pb-[20px] relative shadow-[0_0_10px_#b0bbd8] border-[2px] border-blue-2 bg-white-1 text-blue-7 text-center"
            ref={modalRef}
          >
            <div className="justify-between items-center pb-4">
              <IoMdClose
                className="text-blue-5 hover:text-blue-8 cursor-pointer transition-colors duration-300 ease-in-out block"
                onClick={() => {
                  setMessage("");
                  setMeetModal(false);
                  setConnecting(false);
                  httpClient.put("/delete_meet", { email: selectEmail });
                }}
              />
              <h3 className="text-center border-none">Wanna meet?</h3>
            </div>

            {/* Meeting Options */}
            <div className="">
              <div className="flex justify-center text-white-1 mx-[25px] mb-[10px] max-sm:flex max-sm:flex-col">
                {selectedDocStatus && !selectedDocAvailable && (
                  <button
                    className="px-8 py-4 bg-grey-3 m-4 text-white-1 rounded-[8px] cursor-pointer hover:bg-blue-6 transition-all duration-300 w-auto shadow-[0_0_10px_1px_#b3b8d0;] active:bg-blue-6"
                    onClick={() => {
                      setScheduleMeet(false);
                      setInstantMeet(!isInstantMeet);
                      setConnecting(false);
                    }}
                  >
                    Create an Instant meet
                  </button>
                )}
                <button
                  className="px-8 py-4 bg-grey-3 m-4 text-white-1 rounded-[8px] cursor-pointer hover:bg-blue-6 transition-all duration-300 w-auto shadow-[0_0_10px_1px_#b3b8d0;] active:bg-blue-6"
                  onClick={() => {
                    const d = new Date();
                    setCurDate(
                      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                        2,
                        "0"
                      )}-${String(d.getDate()).padStart(2, "0")}`
                    );
                    setCurTime(
                      `${String(d.getHours()).padStart(2, "0")}:${String(
                        d.getMinutes()
                      ).padStart(2, "0")}`
                    );
                    setInvDateTime(true);
                    setScheduleMeet(!isScheduleMeet);
                    setInstantMeet(false);
                    setConnecting(false);
                  }}
                >
                  Schedule a meet
                </button>
              </div>

              {message && (
                <Alert severity="error" className="mt-4">
                  {message}
                </Alert>
              )}

              {/* Instant Meeting Section */}
              {isInstantMeet && (
                <div className="text-center py-4">
                  {isConnecting ? (
                    <div className="space-y-4">
                      <div className="flex justify-center items-end space-x-1">
                        {[...Array(10)].map((_, index) => (
                          <div
                            key={index}
                            className="w-1 bg-gradient-to-t from-purple-600 to-purple-300 rounded-full animate-wave"
                            style={{
                              animationDelay: `${index * 0.1}s,
                              height: ${(index + 1) * 8}px,
                            `,
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600">Connecting to doctor...</p>
                    </div>
                  ) : (
                    <button
                      className="flex items-center justify-center gap-2 mx-auto px-6 py-3 
                        bg-blue-3 text-white rounded-lg hover:bg-blue-5
                        transition-all duration-300 shadow-md text-white-1"
                      onClick={() => {
                        setConnecting(true);
                        handleMeet();
                      }}
                    >
                      <span>Start Meeting</span>
                      <FaVideo />
                    </button>
                  )}
                </div>
              )}

              {/* Schedule Meeting Section */}
              {isScheduleMeet && (
                <div className="pb-[25px] mb-1">
                  <h4 className="">Select Date and Time</h4>

                  {isInvDateTime && (
                    <Alert severity="error" className="mb-4">
                      Please select a future date and time
                    </Alert>
                  )}

                  {scheduleAlert !== 0 && (
                    <Alert
                      severity={scheduleAlert === 1 ? "error" : "success"}
                      className="mb-4"
                    >
                      {scheduleAlert === 1
                        ? "Doctor is unavailable at selected time"
                        : "Meeting scheduled successfully"}
                    </Alert>
                  )}
                  <div className="w-full flex justify-center">
                    <div className="space-y-4 w-[70%]">
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]} // Prevent selecting past dates
                        value={curDate || ""}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          setCurDate(selectedDate);
                          checkInvDateTime(selectedDate, curTime);
                        }}
                        className="py-[11px] px-[12px] cursor-pointer border-[2px] border-blue-3 rounded-[8px]"
                      />

                      <div className="w-full flex justify-center">
                        <div className="grid grid-cols-3 gap-[5px] max-w-[360px] w-[90vw] border-[2px] border-blue-3 rounded-[8px] p-[5px]">
                          {Object.keys(available).map((time, index) => (
                            <button
                              key={index}
                              className={`border-[2px] boder-blue-3 rounded-[8px] cursor-pointer flex items-center justify-center py-[10px] px-[5px] ${
                                available[time]
                                  ? `border-[2px] border-blue-3 ${
                                      selectedTime === time && "bg-blue-1"
                                    }`
                                  : "bg-blue-2 cursor-not-allowed"
                              }`}
                              disabled={!available[time]} // Accessing the value for each time slot
                              onClick={() => {
                                if (available[time]) {
                                  // Check availability for each time slot
                                  handleActive(index);
                                  checkInvDateTime(curDate, time);
                                  setCurTime(time);
                                  setSelectedTime(time);
                                }
                              }}
                            >
                              <TbPointFilled
                                className={
                                  available[time]
                                    ? "text-[#0f0]"
                                    : "text-[#f00]"
                                } // Using available[time] here
                              />
                              <span className="mx-[10px]">{time}</span>
                              <AiOutlineClockCircle />
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        className={`bg-blue-3 border-[2px] border-blue-5 text-white-1 py-[10px] px-[12px] rounded-[5px] my-[8px] mx-[5px] transition-all duration-300 hover:bg-blue-5 active:bg-blue-5 disabled:bg-blue-5 disabled:cursor-not-allowed`}
                        onClick={handleScheduleClick}
                        disabled={
                          isInvDateTime ||
                          meetScheduling ||
                          !curDate ||
                          !curTime
                        }
                      >
                        {meetScheduling ? (
                          <CircularProgress size={24} sx={{ color: "white" }} />
                        ) : (
                          "Schedule Meeting"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Doctors;
