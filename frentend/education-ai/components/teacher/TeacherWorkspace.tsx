"use client";

import { ConnectedApp } from "../app/LegacyApp";

export default function TeacherWorkspace() {
  return <ConnectedApp allowedRole="teacher" />;
}