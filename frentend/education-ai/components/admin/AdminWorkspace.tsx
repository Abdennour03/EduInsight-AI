"use client";

import { ConnectedApp } from "../app/LegacyApp";

export default function AdminWorkspace() {
  return <ConnectedApp allowedRole="admin" />;
}