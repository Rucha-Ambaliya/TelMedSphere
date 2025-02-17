import React, { useState, useEffect, useContext } from "react";
import Modal from "@mui/material/Modal";
import useDocTitle from "../hooks/useDocTitle";
import { IoMdClose } from "react-icons/io";
import { IoCheckmarkDone } from "react-icons/io5";
import { Alert } from "@mui/material";
import {
  BsEmojiAngry,
  BsEmojiFrown,
  BsEmojiExpressionless,
  BsEmojiSmile,
  BsEmojiLaughing,
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { HiOutlineLightBulb, HiUserGroup } from "react-icons/hi";
import { FaVideo } from "react-icons/fa";
import httpClient from "../httpClient";
import Preloader from "../components/common/Preloader";
import commonContext from "../contexts/common/commonContext";
import useScrollDisable from "../hooks/useScrollDisable";
import HealthFact from "../components/facts/HealthFact";

const Home = () => {
  useDocTitle("Home");
  const navigate = useNavigate();

  const { isLoading, toggleLoading } = useContext(commonContext);

  const [haslastMeet, setHasLastMeet] = useState(
    localStorage.getItem("lastMeetWith") !== undefined &&
      localStorage.getItem("lastMeetWith") !== null &&
      localStorage.getItem("lastMeetWith") !== "null"
  );
  const [feedbackRate, setFeedbackRate] = useState(3);
  const [feedbackAlert, setFeedbackAlert] = useState(false);
  const [searchPatient, setSearchPatient] = useState(
    localStorage.getItem("setSearchPatient") !== undefined &&
      localStorage.getItem("setSearchPatient") !== null &&
      localStorage.getItem("setSearchPatient") === "true"
  );
  const isDoctor = localStorage.getItem("usertype") === "doctor";
  const [searching, setSearching] = useState(
    localStorage.getItem("searching") !== undefined &&
      localStorage.getItem("searching") !== null
      ? localStorage.getItem("searching") === "2"
        ? 2
        : 1
      : 0
  );
  const [patient_name, setPatient_name] = useState(
    localStorage.getItem("curpname") !== undefined &&
      localStorage.getItem("curpname") !== null &&
      localStorage.getItem("curpname") !== "null"
      ? localStorage.getItem("curpname")
      : ""
  );
  const [meetlink, setMeetlink] = useState(
    localStorage.getItem("curmlink") !== undefined &&
      localStorage.getItem("curmlink") !== null &&
      localStorage.getItem("curmlink") !== "null"
      ? localStorage.getItem("curmlink")
      : ""
  );
  const userNotExists =
    localStorage.getItem("usertype") === undefined ||
    localStorage.getItem("usertype") === null;
  const [joinmeet, setJoinmeet] = useState(false);
  const [message, setMessage] = useState("");
  const [joinlink, setJoinlink] = useState("");
  const [doctormail, setDoctorMail] = useState("");
  const [doctorname, setDoctorName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAlert, setIsAlert] = useState("");
  const [availablemodal, setAvailablemodal] = useState(false);
  const [alertmessage, setAlertmessage] = useState("");
  const [available, setAvailable] = useState(
    localStorage.getItem("available") === undefined ||
      localStorage.getItem("available") === null ||
      localStorage.getItem("available") === "true"
  );
  const [isVerified, setVerified] = useState(
    localStorage.getItem("verified") !== undefined &&
      localStorage.getItem("verified") !== null &&
      localStorage.getItem("verified") === "true"
  );
  const [verCont, setVerCont] = useState(
    "Your Account is not verified yet! Please verify for appointments!!"
  );
  const [verAlert, setVerAlert] = useState(false);
  const [availableLoading, setAvailableLoading] = useState(false);

  const handleFeedbackClose = () => {
    httpClient.put("/update_doctor_ratings", {
      demail: localStorage.getItem("lastMeetMail"),
      stars: feedbackRate+1,
    });
    localStorage.setItem("lastMeetWith", null);
    setHasLastMeet(false);

    setFeedbackAlert(true);
    setTimeout(() => {
      setHasLastMeet(false);
      setFeedbackAlert(false);
    }, 2000);
  };
  
  const ratings = [
    "Very Dissatisfied",
    "Dissatisfied",
    "Neutral",
    "Satisfied",
    "Very Satisfied",
  ];

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    const now = new Date(new Date().getTime() - 10 * 60000);

    if (userNotExists) {
      navigate("/");
    }

    if (!userNotExists) {
      if (!isDoctor) {
        toggleLoading(true);
        httpClient
          .post("/patient_apo", { email: localStorage.getItem("email") })
          .then((res) => {
            let upcoming = [];
            res.data.appointments
              .sort()
              .reverse()
              .forEach((appointment) => {
                if (
                  new Date(appointment.date + " " + appointment.time) >= now
                ) {
                  upcoming.unshift(appointment);
                }
              });
            toggleLoading(false);
            setUpcomingAppointments(upcoming);
          })
          .catch((err) => {
            toggleLoading(false);
            console.log(err);
          });
      } else {
        toggleLoading(true);
        httpClient
          .post("/doctor_apo", { demail: localStorage.getItem("email") })
          .then((res) => {
            let upcoming = [];
            res.data.upcomingAppointments
              .sort()
              .reverse()
              .forEach((appointment) => {
                if (
                  new Date(appointment.date + " " + appointment.time) >= now
                ) {
                  upcoming.unshift(appointment);
                }
              });
            toggleLoading(false);
            setUpcomingAppointments(upcoming);
          })
          .catch((err) => {
            toggleLoading(false);
            console.log(err);
          });
      }
    }
    // eslint-disable-next-line
  }, []);

  const searchmeet = () => {
    setSearchPatient(true);
    setSearching(0);
    httpClient
      .post("make_meet", { email: localStorage.getItem("email") })
      .then((res) => {
        console.log(res.data);
        if (res.data.link === null) {
          setTimeout(() => {
            setSearching(1);
          }, 1000);
          setTimeout(() => {
            setSearchPatient(false);
          }, 2000);
        } else {
          setPatient_name(res.data.link["name"]);
          setMeetlink(res.data.link["link"]);
          setTimeout(() => {
            setSearching(2);
          }, 2000);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  {
    localStorage.getItem("usertype") === "doctor" &&
      setInterval(() => {
        setMeetlink(localStorage.getItem("curmlink"));
        setPatient_name(localStorage.getItem("curpname"));
        setSearching(
          localStorage.getItem("searching") === "2"
            ? 2
            : localStorage.getItem("searching") === "1"
            ? 1
            : 0
        );
        setSearchPatient(
          localStorage.getItem("setSearchPatient") === "true" ? true : false
        );
      }, 10000);
  }

  const handleappointmentmeet = (doc, demail, link) => {
    if (doc) {
      setJoinlink(link);
      setDoctorMail(demail);
      setDoctorName(doc);
      setJoinmeet(true);
    } else {
      httpClient.post("meet_status", {
        email: localStorage.getItem("email"),
        link: link,
      });
      httpClient
        .put("/currently_in_meet", { email: localStorage.getItem("email") })
        .then((res) => {
          setSearchPatient(false);
          navigate(link);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handlemeet = () => {
    httpClient
      .post("/meet_status", { email: doctormail })
      .then((res) => {
        if (
          (res.status === 208 && res.data.link === joinlink) ||
          res.status === 200
        ) {
          httpClient
            .put("/make_meet", {
              email: doctormail,
              link: joinlink,
              patient: localStorage.getItem("username"),
            })
            .then((res) => {
              setTimeout(() => {
                httpClient
                  .post("/currently_in_meet", { email: doctormail })
                  .then((res) => {
                    if (res.data.curmeet) {
                      setIsConnecting(false);
                      navigate(joinlink);
                    } else {
                      httpClient.put("/delete_meet", { email: doctormail });
                      setIsConnecting(false);
                      setMessage(res.data.message);
                    }
                  });
              }, 30000);
            })
            .catch(() => {
              // console.log(res)
            });
        } else {
          setIsConnecting(false);
          setMessage(res.data.message);
        }
      })
      .catch(() => {
        // console.log(res)
      });
  };

  const iamavailable = () => {
    setAvailableLoading(true);
    setIsAlert("success");
    setAlertmessage("Now, patients can meet you");
    setAvailablemodal(false);
    setTimeout(() => {
      httpClient.put("/doctor_avilability", {
        demail: localStorage.getItem("email"),
      });
      setIsAlert("");
      setAlertmessage("");
      setAvailable(true);
      localStorage.setItem("available", true);
      setAvailableLoading(false);
    }, 3000);
  };

  const iamnotavailable = () => {
    setAvailableLoading(true);
    setIsAlert("error");
    setAlertmessage("Now, patients can't meet you");
    setAvailablemodal(false);
    setTimeout(() => {
      httpClient.put("/doc_status", { email: localStorage.getItem("email") });
      setIsAlert("");
      setAlertmessage("");
      setAvailable(false);
      localStorage.setItem("available", false);
      setAvailableLoading(false);
    }, 3000);
  };

  const check = () => {
    httpClient
      .post("/verify", { email: localStorage.getItem("email") })
      .then((res) => {
        console.log(res.data);
        if (res.data.verified) {
          setVerCont("Yayy! Your Account is verified!!");
          setVerAlert(true);
          setTimeout(() => {
            setVerified(true);
          }, 2000);
          localStorage.setItem("verified", true);
        } else {
          setVerCont("Oops! Your Account isn't verified yet!!");
          setVerAlert(false);
          setTimeout(() => {
            setVerCont(
              "Your Account is not verified yet! Please verify for appointments!!"
            );
            setVerified(false);
          }, 2000);
          localStorage.setItem("verified", false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // const news = [{message: "Hello! all, today is the holiday", doctor: "Sam"}, {message: "Please be safe and stay at home", doctor: "Joe"}];

  useScrollDisable(isLoading);

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <div className="pt-24">
      {isDoctor && !isVerified && (
        <Alert
          severity={verAlert ? "success" : "error"}
          className="fixed top-24 w-full flex justify-center"
        >
          {verCont}
        </Alert>
      )}

      {isDoctor && !isVerified && (
        <div className="mx-auto w-[93vw] max-w-[1100px] my-8 text-blue-8 flex justify-center items-center">
          <h3>Wanna check your verification status? </h3>
          <button
            onClick={check}
            className="ml-4 bg-blue-8 text-white-1 py-[0.7rem] px-6 rounded-[8px] hover:bg-blue-9 transition-all duration-300 shadow-[0_0_10px_1px_#b0bbd8] cursor-pointer ease-in-out active:bg-blue-9"
          >
            Check
          </button>
        </div>
      )}

      {isDoctor && (
        <div className="mx-auto w-[93vw] max-w-[1100px] relative border-2 border-blue-2 rounded-[8px] mb-12 transition-all duration-400 ease-in-out hover:max-w-[1120px] hover:w-[95vw] hover:border-[3px]  hover:border-blue-4 py-12 px-[10px] max-xs:py-14 max-xs:px-[10px] hover:py-14">
          <div className="absolute inset-0 bg-[url('/search_patients.png')] bg-center bg-no-repeat bg-cover -z-10 blur-[1px]"></div>
          <div className="flex justify-around items-center">
            <div className="text-blue-8 flex flex-wrap items-end">
              <h2 className="mr-[10px]">Is there any patient waiting?</h2>
              <p className="text-[1.2em]">Search for a patient now</p>
            </div>
            <div>
              <button
                onClick={searchmeet}
                disabled={!isVerified}
                className="bg-blue-8 text-white-1 px-8 py-4 rounded-[8px] cursor-pointer transition-all duration-300 ease-in-out shadow-[0_0_10px_1px_#B0BBD8] hover:bg-blue-9 active:bg-blue-9
                            disabled:cursor-not-allowed"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-[93vw] max-w-[1100px] mb-16">
        <h2 className="mb-4 text-blue-8">Upcoming Appointments</h2>
        <div>
          <ul>
            {upcomingAppointments.map((item, index) => (
              <li
                key={index}
                className="border-1 border-blue-4 flex justify-between items-center p-2 px-4 mb-4 bg-blue-2 rounded-lg transition-all duration-300 hover:p-4 hover:border-2 hover:border-blue-5 hover:py-[0.7rem] hover:px-4"
              >
                <div className="text-blue-8 flex flex-wrap items-end">
                  <p className="text-[1.2em] mr-2">
                    {new Date(item.date + " " + item.time)
                      .toString()
                      .slice(0, 3) +
                      "," +
                      new Date(item.date + " " + item.time)
                        .toString()
                        .slice(3, 16) +
                      "at " +
                      new Date(item.date + " " + item.time)
                        .toString()
                        .slice(16, 21)}
                    ,
                  </p>
                  <p> By {item.doctor ? item.doctor : item.patient}</p>
                </div>
                <button
                  className="bg-blue-8 text-white-1 px-8 py-4 rounded-lg transition-all duration-200 hover:bg-blue-9 active:bg-blue-9 disabled:bg-blue-9 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_10px_1px_#b0bbd8]"
                  disabled={new Date(item.date + " " + item.time) > new Date()}
                  onClick={() =>
                    handleappointmentmeet(item.doctor, item.demail, item.link)
                  }
                >
                  Join
                </button>
              </li>
            ))}
            {upcomingAppointments.length === 0 && (
              <li className="flex justify-between items-center py-2 px-4 mb-4 bg-blue-2 rounded-lg border-1 border-blue-4 transition-all duration-300 ease-in-out hover:border-2 hover:border-blue-5 hover:py-[0.7rem] hover:px-4">
                <div className="text-blue-8">No appointments found...</div>
                {!isDoctor && (
                  <button
                    className="bg-blue-8 text-white-1 px-9 py-4 rounded-[8px] cursor-pointer transition-all duration-300 ease-in-out shadow-[0_0_10px_1px_#B0BBD8] hover:bg-blue-9 active:bg-blue-9"
                    onClick={() => navigate("/doctors")}
                  >
                    Book
                  </button>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mx-auto w-[93vw] max-w-[1100px] bg-[#eedfa3] border-2 border-[#ff5500] p-6 text-[#ff5500] rounded-lg mb-20 transition-all duration-300 hover:w-[95vw] hover:p-8 hover:border-3">
        <div className="flex items-center mb-4 text-[#ff5900]">
          <HiOutlineLightBulb className="text-4xl mr-2" />
          <h2>Healthy Fact of the Day</h2>
        </div>
        <div className="px-4">
          <HealthFact />
        </div>
      </div>

      {isDoctor && isVerified && (
        <div
          onClick={() => setAvailablemodal(true)}
          className="fixed bottom-10 left-5 p-3 rounded-lg cursor-pointer z-50 flex flex-col items-center bg-blue-9 text-white-1 transition-all duration-300 ease-in-out shadow-[0_0_10px_1px_#B0BBD8] hover:bg-blue-8 active:bg-blue-8 "
        >
          {isAlert !== "" && (
            <Alert
              severity={isAlert}
              className="absolute -top-16 text-black w-64 left-0"
            >
              {alertmessage}
            </Alert>
          )}
          Set your availability
          {/* Show Spinner while loading */}
          <span
            className="w-full h-[3px] rounded-lg flex items-center mt-1"
          >
            <span
              className={`h-[3px] rounded-lg ${
                availableLoading
                  ? `${available ? "bg-red-500" : "bg-green-500"} animate-progressFill`
                  : available
                  ? "bg-green-500 w-full"
                  : "bg-red-500 w-full"
              }`}
            ></span>
          </span>
        </div>
      )}

      {/* Feedback Modal for Patients */}
      <Modal
        open={haslastMeet && !isDoctor}
        onClose={handleFeedbackClose}
        className="flex items-center justify-center"
      >
        <div className="w-[min(500px,90vw)] bg-white-1 border-2 border-blue-2 rounded-lg p-4 shadow-[0_0_10px_1px_#b0bbd8] text-blue-7 text-center relative outline-none">
          <div
            className="absolute top-2 right-2 text-blue-5 hover:text-blue-8 cursor-pointer transition-colors duration-300"
            onClick={handleFeedbackClose}
          >
            <IoMdClose />
          </div>

          <div className="feedback-details">
            {feedbackAlert && (
              <Alert severity="success">Thank you for your response</Alert>
            )}
            <h3 className="my-4 text-xl font-semibold">Feedback</h3>
            <div className="mb-3">
              How was your consultation with{" "}
              {localStorage.getItem("lastMeetWith")}?
            </div>

            <div className="ratings">
              <div className="flex justify-center items-center mb-4">
                {[0, 1, 2, 3, 4].map((rate, index) => (
                  <div
                    key={rate}
                    className={`text-4xl mx-2 cursor-pointer ${
                      feedbackRate === rate
                        ? rate < 2
                          ? "text-red-500"
                          : rate < 3
                          ? "text-orange-500"
                          : "text-green-500"
                        : "text-gray-500"
                    }`}
                    onClick={() => setFeedbackRate(rate)}
                  >
                    {
                      [
                        <BsEmojiAngry key={0} />,
                        <BsEmojiFrown key={1} />,
                        <BsEmojiExpressionless key={2} />,
                        <BsEmojiSmile key={3} />,
                        <BsEmojiLaughing key={4} />,
                      ][index]
                    }
                  </div>
                ))}
              </div>

              <div className="mt-4 mb-4 text-lg">{ratings[feedbackRate]}</div>
            </div>
          </div>

          <div>
            <button
              onClick={handleFeedbackClose}
              disabled={feedbackAlert}
              className="bg-blue-4 text-white-1 px-6 py-4 rounded hover:bg-blue-6 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {feedbackAlert ? "Submitted" : "Submit"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal for Doctors */}
      <Modal
        open={haslastMeet && isDoctor}
        onClose={() => {
          localStorage.setItem("lastMeetWith", null);
          setHasLastMeet(false);
        }}
        className="flex items-center justify-center"
      >
        <div className="w-[min(500px,90vw)] bg-white-1 border-2 border-blue-2 rounded-lg p-4 shadow-lg text-blue-7 text-center relative">
          <div
            className="absolute top-2 right-2 text-blue-5 hover:text-blue-8 cursor-pointer transition-colors duration-300"
            onClick={() => {
              localStorage.setItem("lastMeetWith", null);
              httpClient.put("/delete_meet", { email: doctormail });
              setHasLastMeet(false);
            }}
          >
            <IoMdClose className="text-2xl" />
          </div>

          <div className="pb-6 text-center">
            <h3 className="my-3 text-xl font-semibold flex items-center justify-center">
              Thank You <BsEmojiSmile className="ml-2" />
            </h3>
            <div className="thankyou-note text-blue-6">
              Thank you, {localStorage.getItem("username")}!!
              <br />
              You just treated one more life!
            </div>
          </div>
        </div>
      </Modal>

      {/* Search Patient Modal */}
      <Modal
        open={searchPatient}
        onClose={() => setSearchPatient(false)}
        className="flex items-center justify-center outline-none border-none"
      >
        <div className="w-[min(500px,90vw)] bg-white-1 border-2 border-blue-2 rounded-lg py-[14px] px-[20px] shadow-[0_0_10px_1px_#b0bbd8] text-blue-7 text-center relative outline-none">
          <div
            className="absolute top-2 right-2 text-blue-5 hover:text-blue-8 cursor-pointer transition-colors duration-300 ease-in-out"
            onClick={() => setSearchPatient(false)}
          >
            <IoMdClose className="" />
          </div>

          {searching === 0 && (
            <div className="text-center bg-white-1 flex flex-col items-center py-4 px-[10px]">
              <div className="relative py-4 mb-8">
                <HiUserGroup className="w-[min(70vw,200px)] h-[min(70vw,200px)] text-blue-5" />
                <div className="absolute bottom-[10px] right-[10px] w-[min(100px,50vw)] h-[min(100px,50vw)] rounded-full">
                  <div className="w-full h-full animate-rotate">
                    <div className="absolute bottom-0 right-0 w-[min(150px,40vw)] h-[min(150px,40vw)] animate-maintain">
                      <img
                        className="w-full h-full"
                        src="search-img.png"
                        alt="searching"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-lg">Searching...</h3>
            </div>
          )}

          {searching === 1 && (
            <div className="text-center bg-white-1 flex flex-col items-center">
              <div className="relative p-4">
                <HiUserGroup className="w-[min(70vw,200px)] h-[min(70vw,200px)] text-blue-5" />
                <div className="absolute bottom-2.5 right-2.5 w-[min(100px,50vw)] h-[min(100px,50vw)] rounded-full bg-white-1 border-social-whatsapp p-2.5 text-social-whatsapp flex items-center justify-center border-[5px]">
                  <IoCheckmarkDone className="w-[min(90px,45vw)] h-[min(90px,45vw)]" />
                </div>
              </div>
              <h3 className="mt-4">No Patients Found!</h3>
            </div>
          )}

          {searching === 2 && (
            <div className="text-center bg-white-1 flex flex-col items-center outline-none border-none">
              <h3 className="mb-6 mt-2">Patient Found!</h3>
              <div className="flex flex-col items-center">
                <div>Name: {patient_name}</div>
                <div className="py-4 text-white-1">
                  <button
                    onClick={() => {
                      httpClient.post("meet_status", {
                        email: localStorage.getItem("email"),
                      });
                      httpClient
                        .put("/currently_in_meet", {
                          email: localStorage.getItem("email"),
                        })
                        .then((res) => {
                          setSearchPatient(false);
                          localStorage.setItem("setSearchPatient", false);
                          navigate(`${meetlink}`);
                        })
                        .catch((err) => console.log(err));
                    }}
                    className="bg-blue-4 border text-white-1 px-3.5 py-3 rounded my-2 mx-1.5 transition-all duration-300 hover:bg-blue-9"
                  >
                    Connect now <FaVideo className="inline" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Join Meet Modal */}
      <Modal
        open={joinmeet}
        onClose={() => {
          setJoinmeet(false);
          setIsConnecting(false);
          setMessage(false);
          setDoctorMail("");
          setDoctorName("");
          setJoinlink("");
        }}
      >
        <div className="absolute top-1/2 bg-white-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[500px] p-4 px-5 shadow-lg border-2 border-blue-200 bg-white rounded-lg text-blue-700 text-center">
          <div className="text-right text-blue-500  hover:text-blue-800 transition-all duration-300 cursor-pointer">
            <IoMdClose
              onClick={() => {
                setJoinmeet(false);
                setIsConnecting(false);
                setMessage(false);
                setDoctorMail("");
                setDoctorName("");
                setJoinlink("");
              }}
            />
          </div>
          <div className="meet-details">
            {message && (
              <div className="not-available-note">
                Oops! {doctorname} is currently in another meet, you can wait a
                few minutes or else try again.{" "}
              </div>
            )}
          </div>
          {isConnecting ? (
            <div className="flex flex-col items-center justify-center">
              <div className="flex space-x-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-8 bg-blue-4 animate-wave"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
              <div>Connecting...</div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setIsConnecting(true);
                  handlemeet();
                }}
                className="bg-blue-4 border text-white-1 px-3 py-2.5 rounded my-2 mx-1.5 transition-all duration-300 hover:bg-blue-9"
              >
                Connect <FaVideo className="inline" />
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Available Modal */}
      <Modal open={availablemodal} onClose={() => setAvailablemodal(false)}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[min(95%,400px)] p-3.5 px-5 shadow-lg border-2 border-blue-2 bg-[#F5F5F5] rounded-lg text-blue-7 text-center outline-none">
          <div className="text-right text-blue-5 hover:text-blue-8 transition-all duration-300 cursor-pointer">
            <IoMdClose onClick={() => setAvailablemodal(false)} />
          </div>
          <div className="flex flex-col items-center justify-center gap-2.5 text-white-1">
            <div
              onClick={() => iamavailable()}
              disabled={available}
              className={`bg-blue-4 text-white-1  p-2.5 rounded-lg w-[min(90%,250px)] cursor-pointer transition-all duration-300 hover:bg-blue-9 mb-3 mt-1 ${
                available && "pointer-events-none"
              }`}
            >
              Yes, I am available!
            </div>
            <div
              onClick={() => iamnotavailable()}
              className={`bg-blue-4 text-white-1  p-2.5 rounded-lg w-[min(90%,250px)] cursor-pointer transition-all duration-300 hover:bg-blue-9 mb-3 mt-1 ${
                !available && "pointer-events-none"
              }`}
            >
              No, I am not available!
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Home;
