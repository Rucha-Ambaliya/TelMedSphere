import React, { useContext, useRef, useState } from 'react';
import commonContext from '../../contexts/common/commonContext';
import useOutsideClose from '../../hooks/useOutsideClose';
import useScrollDisable from '../../hooks/useScrollDisable';
import { Alert, CircularProgress } from "@mui/material";
import { Lock, Mail, Phone, User } from 'lucide-react';
import httpClient from '../../httpClient';

const AccountForm = () => {
    const { isFormOpen, toggleForm, setFormUserInfo } = useContext(commonContext);
    const [username, setUsername] = useState("");
    const [usertype, setUsertype] = useState("patient");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("male");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [passwd, setPasswd] = useState("");
    const [isInvPhone, setIsInvPhone] = useState(false);
    const [specialization, setSpecialization] = useState("");
    const [isInvEmail, setIsInvEmail] = useState(false);
    const [isInvPass, setIsInvPass] = useState(false);
    const [isInvAge, setIsInvAge] = useState(false);
    const [isAlert, setIsAlert] = useState("");
    const [alertCont, setAlertCont] = useState("");
    const [isSuccessLoading, setIsSuccessLoading] = useState(false);
    const [doctorId, setDoctorId] = useState("");
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isSignupVisible, setIsSignupVisible] = useState(false);

    const formRef = useRef();

    useOutsideClose(formRef, () => {
        resetForm();
    });

    useScrollDisable(isFormOpen);

    const resetForm = () => {
        toggleForm(false);
        setUsername("");
        setUsertype("patient");
        setAge("");
        setGender("male");
        setPhone("");
        setEmail("");
        setPasswd("");
        setSpecialization("");
        setIsForgotPassword(false);
        setIsSignupVisible(false);
    };

    const handleIsSignupVisible = () => {
        setIsSignupVisible(prevState => !prevState);
        setIsForgotPassword(false);
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (isInvEmail) return;

        setIsSuccessLoading(true);
        try {
            await httpClient.post("/forgot_password", { email });
            setIsAlert("success");
            setAlertCont("Password reset link sent to your email");
            setTimeout(() => {
                setIsAlert("");
                setIsForgotPassword(false);
            }, 1500);
        } catch (err) {
            setIsAlert("error");
            setAlertCont("Email not found");
            setTimeout(() => setIsAlert(""), 1500);
        }
        setIsSuccessLoading(false);
    };

    const checkAge = (a) => {
        const t = (parseInt(a) > 0 && parseInt(a) <= 120 && /^[0-9]{1,3}$/.test(a));
        setIsInvAge(!t);
        return t;
    };

    const checkEmail = (email) => {
        // eslint-disable-next-line
        const res = (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email));
        setIsInvEmail(!res);
        return res;
    };

    const checkPasswd = (passwd) => {
        const res = (/^.{6,}$/.test(passwd));
        setIsInvPass(!res);
        return res;
    };

    const validatePhoneNumber = (phoneNumber) => {
        const pattern = /^\+?1?\d{10,10}$/;
        const res = pattern.test(phoneNumber);
        setIsInvPhone(!res);
        return res;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (isInvEmail || isInvPass || isInvPhone) return;

        setIsSuccessLoading(true);
        try {
            if (isSignupVisible) {
                const res = await httpClient.post("/register", {
                    username,
                    registerer: usertype,
                    age,
                    gender,
                    phone: "91" + phone,
                    email,
                    passwd,
                    specialization
                });
                setIsAlert("success");
                setAlertCont("Signup Successful");
                setTimeout(() => {
                    setIsAlert("");
                    setFormUserInfo({
                        username,
                        usertype,
                        gender,
                        phone,
                        email,
                        passwd,
                        specialization,
                        age,
                        verified: false
                    });
                    resetForm();
                }, 1500);
            } else {
                const res = await httpClient.post("/login", { email, passwd });
                localStorage.setItem("token", res.data.access_token);
                setIsAlert("success");
                setAlertCont("Login Successful");
                setTimeout(() => {
                    setIsAlert("");
                    resetForm();
                    setFormUserInfo({
                        username: res.data.username,
                        usertype: res.data.usertype,
                        gender: res.data.gender,
                        phone: res.data.phone,
                        email,
                        passwd,
                        specialization: res.data.specialization,
                        age: res.data.age,
                        verified: res.data.verified
                    });
                }, 1500);
            }
        } catch (err) {
            setIsAlert("error");
            setAlertCont(isSignupVisible ? "User already exists" : "Login Failed");
            setTimeout(() => setIsAlert(""), 1500);
        }
        setIsSuccessLoading(false);
    };

    return (
        <>
            {isFormOpen && (
             <div className="fixed inset-0 flex items-center justify-center z-[+9999] p-4">

                    <div className="w-full max-w-lg bg-gray-50 ">
                        <form ref={formRef} onSubmit={isForgotPassword ? handleForgotPassword : handleFormSubmit} 
                             className="bg-gray rounded-lg p-8 relative w-full max-h-[90vh] overflow-y-auto shadow-lg z-[1050]">
                            {isAlert !== "" && (
                                <div className="mb-4">
                                    <Alert severity={isAlert}>{alertCont}</Alert>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                    {isForgotPassword ? 'Forgot Password' : (isSignupVisible ? 'Sign Up' : 'Login')}
                                </h2>
                                {!isForgotPassword && (
                                    <p className="text-gray-600 text-sm">
                                        {isSignupVisible ? 'Already have an account?' : 'New to TelMedSphere?'}
                                        <button type="button" 
                                                onClick={handleIsSignupVisible}
                                                className="text-blue-600 font-medium ml-2 hover:underline">
                                            {isSignupVisible ? 'Login' : 'Create an account'}
                                        </button>
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4">
                                {isSignupVisible && (
                                    <>
                                        <div>
                                            <label className="block text-gray-600 mb-2">Register as</label>
                                            <div className="flex gap-6 mt-2">
                                                {['patient', 'doctor'].map((type) => (
                                                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="usertype"
                                                            value={type}
                                                            checked={usertype === type}
                                                            onChange={(e) => setUsertype(e.target.value)}
                                                            className="w-4 h-4 text-blue-600"
                                                        />
                                                        <span className="text-gray-700 capitalize">{type}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        {usertype === "doctor" && (
                                            <>
                                                <input
                                                    type="text"
                                                    placeholder="Specialization (e.g., Cancer Surgeon)"
                                                    value={specialization}
                                                    onChange={(e) => setSpecialization(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Doctor ID"
                                                    value={doctorId}
                                                    onChange={(e) => setDoctorId(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                            </>
                                        )}

                                        {usertype === "patient" && (
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Age"
                                                    value={age}
                                                    onChange={(e) => {
                                                        checkAge(e.target.value);
                                                        setAge(e.target.value);
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                                {age !== "" && isInvAge && (
                                                    <p className="text-red-500 text-sm mt-1">Invalid Age</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex gap-6">
                                            {["male", "female", "other"].map((g) => (
                                                <label key={g} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value={g}
                                                        checked={gender === g}
                                                        onChange={(e) => setGender(e.target.value)}
                                                        className="w-4 h-4 text-blue-600"
                                                    />
                                                    <span className="text-gray-700 capitalize">{g}</span>
                                                </label>
                                            ))}
                                        </div>

                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Phone"
                                                value={phone}
                                                onChange={(e) => {
                                                    validatePhoneNumber(e.target.value);
                                                    setPhone(e.target.value);
                                                }}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                            {phone !== "" && isInvPhone && (
                                                <p className="text-red-500 text-sm mt-1">Invalid Phone Number</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => {
                                            checkEmail(e.target.value);
                                            setEmail(e.target.value);
                                        }}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    {email !== "" && isInvEmail && (
                                        <p className="text-red-500 text-sm mt-1">Invalid Email</p>
                                    )}
                                </div>

                                {!isForgotPassword && (
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={passwd}
                                            onChange={(e) => {
                                                checkPasswd(e.target.value);
                                                setPasswd(e.target.value);
                                            }}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        {isSignupVisible && passwd !== "" && isInvPass && (
                                            <p className="text-red-500 text-sm mt-1">Password should contain at least 6 characters</p>
                                        )}
                                    </div>
                                )}

                                {!isSignupVisible && !isForgotPassword && (
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotPassword(true)}
                                        className="text-blue-600 text-sm hover:underline text-left"
                                    >
                                        Forgot Password?
                                    </button>
                                )}

                                {isForgotPassword && (
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotPassword(false)}
                                        className="text-blue-600 text-sm hover:underline text-left"
                                    >
                                        Back to Login
                                    </button>
                                )}

<button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium mt-4 hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={isSuccessLoading}
                                >
                                    {isSuccessLoading ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        isForgotPassword ? 'Send Reset Link' : (isSignupVisible ? 'Sign Up' : 'Login')
                                    )}
                                </button>
                            </div>

                            <button
                                type="button"
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-colors text-xl"
                                onClick={() => toggleForm(false)}
                            >
                                ×
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AccountForm;