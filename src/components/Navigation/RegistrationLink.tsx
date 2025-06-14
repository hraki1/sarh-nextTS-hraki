"use client";

import { useContext, useState } from "react";
import Modal from "../UI/Modal";
import { FcGoogle } from "react-icons/fc";
import { GoSignIn } from "react-icons/go";
import { useMutation } from "@tanstack/react-query";
import { signUp, SignUpRequest } from "@/lib/axios/signUpAxios";
import toast from "react-hot-toast";
import { login, loginRequest } from "@/lib/axios/loginAxios";
import { otpRequest, otpVerify } from "@/lib/axios/otpAxios";
import { AuthContext } from "@/store/AuthContext";
import { AuthModalContext } from "@/store/AuthModalContext";
import Link from "next/link";
import { restPasswordRequest } from "@/lib/axios/resetPasswordAxios";

export default function RegistrationLink() {
  const { login: loginCxt } = useContext(AuthContext);
  const { openAuthModal, closeAuthModal, isAuthModalOpen } =
    useContext(AuthModalContext);

  // const [isAuthModalOpen, setisAuthModalOpen] = useState(false);
  const [contentView, setContentView] = useState<string | null>("login");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formInput, setFormInput] = useState({
    name: "",
    email: "",
    pass: "",
    phone: "",
    agreePolicy: false,
    otp: "",
  });

  const [successResetPasswordRequest, setSuccessResetPasswordRequest] =
    useState<string | null>(null);

  // signup mutation field .....
  const { mutate: mutateSignup, isPending: isPendingSignup } = useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      console.log("تم إنشاء الحساب بنجاح", data);
      setContentView("otp");
    },
    onError: (error: Error) => {
      console.log("خطأ أثناء التسجيل:", error.message);
      toast.error(error.message);
    },
  });

  // login mutation field .....
  const { mutate: mutateLogin, isPending: isPendingLogin } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log("تم إنشاء الحساب بنجاح", data);
      console.log(data);
      if (data.requiresVerification) {
        setContentView("otp");
      } else {
        loginCxt(data.token, data.user);
        handlerResetForm();
      }
    },
    onError: (error: Error) => {
      console.log("خطأ أثناء التسجيل:", error.message);
      toast.error(error.message);
    },
  });

  // otp mutation field .....
  const { mutate: mutateOtp, isPending: isPendingOtp } = useMutation({
    mutationFn: otpVerify,
    onSuccess: (data) => {
      console.log("تم ارسال otp", data);
      loginCxt(data.token, data.user);
      handlerResetForm();
      handleCloseModal();
    },
    onError: (error: Error) => {
      console.log("خطأ أثناء otp:", error.message);
      toast.error(error.message);
    },
  });

  // rest Password mutation field .....
  const {
    mutate: mutateRequestResetPassword,
    isPending: isPendingResetPassword,
  } = useMutation({
    mutationFn: restPasswordRequest,
    onSuccess: (data) => {
      setSuccessResetPasswordRequest(data.message);
      console.log("تم ارسال otp", data);
    },
    onError: (error: Error) => {
      console.log("خطأ أثناء rest password:", error.message);
      toast.error(error.message);
      setErrors({ restPassword: error.message });
    },
  });

  // update state data every change ...
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormInput((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // forms actions field ....
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formInput.email) newErrors.email = "يرجى تعبئة البريد الإلكتروني";
    if (!formInput.pass) newErrors.pass = "يرجى تعبئة كلمة المرور";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("تسجيل الدخول:", formInput);
      const payload: loginRequest = {
        email: formInput.email,
        password: formInput.pass,
      };
      mutateLogin(payload);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formInput.name) newErrors.name = "الاسم مطلوب";
    if (!formInput.email) newErrors.email = "البريد الإلكتروني مطلوب";
    if (!formInput.phone) newErrors.phone = "رقم الهاتف مطلوب";
    if (!formInput.pass) newErrors.pass = "كلمة المرور مطلوبة";

    const generalPhoneRegex = /^[0-9]{8,15}$/;
    if (formInput.phone && !generalPhoneRegex.test(formInput.phone)) {
      newErrors.phone = "رقم الهاتف غير صالح";
    }

    if (!formInput.agreePolicy)
      newErrors.agreePolicy = "يجب الموافقة على سياسة الخصوصية";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("إنشاء الحساب:", formInput);

      const payload: SignUpRequest = {
        full_name: formInput.name,
        email: formInput.email,
        password: formInput.pass,
        phone_number: formInput.phone,
      };
      mutateSignup(payload);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (formInput.otp.length !== 6) newErrors.otp = "OTP يرجى تعبئة";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("تاكيد otp ", formInput);
      const payload: otpRequest = {
        email: formInput.email,
        otp: formInput.otp,
      };
      mutateOtp(payload);
    }
  };

  // send aplly to change password  ...
  function handleForgetPassword() {
    console.log(formInput.email);
    mutateRequestResetPassword({ email: formInput.email });
  }

  // handle close modal and rest it ...
  function handleCloseModal() {
    handlerResetForm();
    closeAuthModal();
    setContentView("login");
    setSuccessResetPasswordRequest(null);
  }

  // handle reset and clear inputs form ...
  function handlerResetForm() {
    setFormInput({
      name: "",
      email: "",
      pass: "",
      phone: "",
      agreePolicy: false,
      otp: "",
    });
  }

  return (
    <>
      <GoSignIn
        className="pr-text text-2xl cursor-pointer"
        onClick={() => {
          openAuthModal();
          setErrors({});
        }}
      />

      <Modal open={isAuthModalOpen} classesName="pr-bg">
        <div className="pr-bg text-white rounded-2xl w-full max-w-md p-6 relative z-[1500]">
          {/* زر الإغلاق */}
          <button
            onClick={handleCloseModal}
            className="absolute top-3 right-3 text-5xl text-gray-300 hover:text-white"
            aria-label="إغلاق"
          >
            &times;
          </button>

          {contentView === "login" && (
            <>
              <h2 className="text-xl font-bold mb-4 text-center">
                تسجيل الدخول
              </h2>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <div className="flex justify-between">
                    <label className="block mb-1 text-sm">
                      البريد الإلكتروني
                    </label>
                    {errors.email && (
                      <span className="text-red-400 text-sm mt-1">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <input
                    name="email"
                    type="email"
                    value={formInput.email}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded bg-slate-700 border ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-600 focus:ring-blue-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <label className="block mb-1 text-sm">كلمة المرور</label>
                    {errors.pass && (
                      <p className="text-red-400 text-sm mt-1">{errors.pass}</p>
                    )}
                  </div>

                  <input
                    name="pass"
                    type="password"
                    value={formInput.pass}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded bg-slate-700 border ${
                      errors.pass
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-600 focus:ring-blue-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  disabled={isPendingLogin}
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded text-white"
                >
                  {isPendingLogin ? "... تسجيل الدخول" : "تسجيل الدخول"}
                </button>
              </form>
              <div className="flex justify-between">
                <div className="text-center my-4 text-sm">
                  <button
                    onClick={() => {
                      setContentView("forgetPssword");
                      setErrors({});
                    }}
                    className="text-blue-400 hover:underline"
                  >
                    نسيان كلمة المرور
                  </button>
                </div>
                <div className="text-center my-4 text-sm">
                  ليس لديك حساب؟{" "}
                  <button
                    onClick={() => {
                      setContentView("signup");
                      setErrors({});
                    }}
                    className="text-blue-400 hover:underline"
                  >
                    إنشاء حساب
                  </button>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href={
                    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/auth/google"
                  }
                  className="flex items-center justify-center gap-2 border border-gray-600 hover:bg-gray-700 w-full py-2 rounded"
                >
                  <FcGoogle className="text-xl" />
                  <span>تسجيل الدخول عبر Google</span>
                </Link>
              </div>
            </>
          )}

          {contentView === "signup" && (
            <>
              <h2 className="text-xl font-bold mb-2 text-center">
                إنشاء حساب جديد
              </h2>

              <form className="space-y-4" onSubmit={handleRegister}>
                <div>
                  <div className="flex justify-between">
                    <label className="block mb-1 text-sm">الاسم الكامل</label>
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <input
                    name="name"
                    type="text"
                    value={formInput.name}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded bg-slate-700 border ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-600 focus:ring-green-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="الاسم الكامل"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <label className="block mb-1 text-sm">رقم الهاتف</label>
                    {errors.phone && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <input
                    name="phone"
                    type="tel"
                    value={formInput.phone}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded bg-slate-700 border ${
                      errors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-600 focus:ring-green-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="078XXXXXXXX"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <label className="block mb-1 text-sm">
                      البريد الإلكتروني
                    </label>
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <input
                    name="email"
                    type="email"
                    value={formInput.email}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded bg-slate-700 border ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-600 focus:ring-green-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <label className="block mb-1 text-sm">كلمة المرور</label>
                    {errors.pass && (
                      <p className="text-red-400 text-sm mt-1">{errors.pass}</p>
                    )}
                  </div>

                  <input
                    name="pass"
                    type="password"
                    value={formInput.pass}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded bg-slate-700 border ${
                      errors.pass
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-600 focus:ring-green-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      id="agree"
                      type="checkbox"
                      name="agreePolicy"
                      checked={formInput.agreePolicy}
                      onChange={handleInputChange}
                      className={`${
                        errors.agreePolicy ? "border-red-500" : ""
                      }`}
                    />
                    <label htmlFor="agree">أوافق على سياسة الخصوصية</label>
                  </div>

                  {errors.agreePolicy && (
                    <p className="text-red-400 text-sm mt-1 text-end">
                      {errors.agreePolicy}
                    </p>
                  )}
                </div>

                <button
                  disabled={isPendingSignup}
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 transition-colors py-2 rounded text-white cursor-pointer"
                >
                  {isPendingSignup ? "... تسجيل" : " إنشاء حساب"}
                </button>
              </form>

              <div className="text-center mt-4">
                <Link
                  href={
                    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/auth/google"
                  }
                  className="flex items-center justify-center gap-2 border border-gray-600 hover:bg-gray-700 w-full py-2 rounded"
                >
                  <FcGoogle className="text-xl" />
                  <span>تسجيل الدخول عبر Google</span>
                </Link>
              </div>
              <div className="flex justify-between">
                <div className="text-center my-4 text-sm">
                  <button
                    onClick={() => {
                      setContentView("forgetPssword");
                      setErrors({});
                    }}
                    className="text-blue-400 hover:underline"
                  >
                    نسيان كلمة المرور
                  </button>
                </div>
                <div className="text-center mt-4 text-sm">
                  لديك حساب؟{" "}
                  <button
                    onClick={() => {
                      setContentView("login");
                      setErrors({});
                    }}
                    className="text-green-400 hover:underline"
                  >
                    تسجيل الدخول
                  </button>
                </div>
              </div>
            </>
          )}

          {contentView === "otp" && (
            <>
              <h2 className="text-xl font-bold mb-4 text-center">OTP</h2>
              <form
                className="space-y-4 text-center"
                onSubmit={handleVerifyOtp}
              >
                <div>
                  <div className="flex justify-between">
                    <label className="block mb-1 ">
                      We Sent OTP To :{" "}
                      <span className="text-sm text-gray-400">
                        {" "}
                        {formInput.email}
                      </span>{" "}
                    </label>
                    {errors.otp && (
                      <span className="text-red-400 text-sm mt-1">
                        {errors.otp}
                      </span>
                    )}
                  </div>

                  <input
                    name="otp"
                    type="string"
                    onChange={handleInputChange}
                    value={formInput.otp}
                    className={`w-full p-2 rounded bg-slate-700 text-center border ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-600 focus:ring-blue-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="ادخل 6 رموز هنا لتأكيد حسابك"
                  />
                </div>

                <button
                  disabled={isPendingOtp}
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded text-white cursor-pointer"
                >
                  {isPendingOtp ? "... تأكيد" : "تأكيد"}
                </button>
              </form>
            </>
          )}

          {contentView === "forgetPssword" && (
            <>
              {successResetPasswordRequest ? (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-center ">
                    Forget Password
                  </h2>
                  <div className="space-y-4 text-center">
                    <div>
                      <div className="flex justify-center">
                        <label className="block mb-2 text-gray-300">
                          We Send Reset Password Link to Your email
                        </label>
                        {errors.otp && (
                          <span className="text-red-400 text-sm mt-1">
                            {errors.restPassword}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded text-white cursor-pointer"
                    >
                      Done
                    </button>
                    <div className="text-center my-4 text-sm"></div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-center ">
                    Forget Password
                  </h2>
                  <div className="space-y-4 text-center">
                    <div>
                      <div className="flex justify-center">
                        <label className="block mb-2 text-gray-300">
                          Please Enter Your Email
                        </label>
                        {errors.otp && (
                          <span className="text-red-400 text-sm mt-1">
                            {errors.otp}
                          </span>
                        )}
                      </div>

                      <input
                        name="email"
                        type="string"
                        onChange={handleInputChange}
                        value={formInput.email}
                        className={`w-full p-2 rounded bg-slate-700 text-center border ${
                          errors.email
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-600 focus:ring-blue-500"
                        } focus:outline-none focus:ring-2`}
                        placeholder="ادخل بريدك الأكتروني هنا لارسال رابط تغيير كلمة السر"
                      />
                    </div>

                    <button
                      disabled={isPendingResetPassword}
                      type="button"
                      onClick={handleForgetPassword}
                      className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded text-white cursor-pointer"
                    >
                      {isPendingResetPassword ? "... ارسال" : "ارسال"}
                    </button>
                    <div className="text-center my-4 text-sm">
                      ليس لديك حساب؟{" "}
                      <button
                        onClick={() => {
                          setContentView("signup");
                          setErrors({});
                        }}
                        className="text-blue-400 hover:underline"
                      >
                        إنشاء حساب
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
