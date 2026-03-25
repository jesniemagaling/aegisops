"use client";

import { useEffect, useCallback } from "react";
import { getUsers } from "@/lib/api";
import { useApi } from "@/hooks";
import type { PaginatedData, User } from "@/types";

export default function UsersPage() {
  const fetchUsers = useCallback(() => getUsers(1, 10), []);
  const { data, loading, error, execute } =
    useApi<PaginatedData<User>>(fetchUsers);

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {data?.items.map((user) => (
          <li key={user.id}>
            {user.fullName} — {user.email} — {user.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
