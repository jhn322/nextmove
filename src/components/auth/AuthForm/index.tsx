"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { AuthFormProps, AuthFormData } from "./types";
import { loginSchema } from "@/lib/validations/auth/login";
import { registerApiSchema as registerSchema } from "@/lib/validations/auth/register";

const getValidationSchema = (mode: "login" | "register") => {
  return mode === "login" ? loginSchema : registerSchema;
};

type FormValues = AuthFormData;

export const AuthForm = ({
  mode,
  onSubmit,
  isLoading = false,
  error,
}: AuthFormProps) => {
  const validationSchema = getValidationSchema(mode);

  const form = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleFormSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {mode === "register" && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your Name"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...field}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="••••••••"
                  {...field}
                  disabled={isLoading}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {mode === "register" && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    {...field}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {error && (
          <div className="text-destructive text-sm text-center pt-2">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? "Processing..."
            : mode === "login"
              ? "Sign In"
              : "Create Account"}
        </Button>
      </form>
    </Form>
  );
};
