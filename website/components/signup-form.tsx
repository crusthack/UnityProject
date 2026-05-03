"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";

export default function SignUpForm() {
  const router = useRouter();
  const { setToken } = useAuth();
  const [formData, setFormData] = useState({
    userID: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await signUp(formData);
      await setToken(response.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">회원가입</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="아이디"
          name="userID"
          value={formData.userID}
          onChange={handleChange}
          required
          placeholder="아이디를 입력하세요 (예: test1234)"
        />

        <Input
          label="비밀번호"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="비밀번호를 입력하세요 (예: qwer1234)"
        />

        <Input
          label="비밀번호 재입력"
          type="password"
          name="passwordConfirm"
          value={formData.passwordConfirm}
          onChange={handleChange}
          required
          placeholder="비밀번호를 다시 입력하세요"
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Button type="submit" isLoading={isLoading}>
          회원가입
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          로그인
        </Link>
      </p>
    </div>
  );
}

