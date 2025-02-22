"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function HomeSuperAdmin() {
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Início - SuperAdmin</CardTitle>
        <CardDescription>Seja Bem vindo</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
      
      </CardContent>
    </Card>
  );
}
