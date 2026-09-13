"use client";

import { ConnectedApp } from "../app/LegacyApp";

export default function StudentWorkspace() {
  return <ConnectedApp allowedRole="student" />;
}