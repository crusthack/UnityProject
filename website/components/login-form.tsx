"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const { setToken } = useAuth();
  const [formData, setFormData] = useState({
    userID: "",
    password: "",
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
    setIsLoading(true);

    try {
      const response = await login(formData);
      await setToken(response.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">로그인</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="아이디"
          name="userID"
          value={formData.userID}
          onChange={handleChange}
          required
          placeholder="아이디를 입력하세요"
        />

        <Input
          label="비밀번호"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="비밀번호를 입력하세요"
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Button type="submit" isLoading={isLoading}>
          로그인
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="text-blue-600 hover:underline font-medium">
          회원가입
        </Link>
      </p>
    </div>
  );
}

