"use client";

import { useEffect, useMemo, useState } from "react";

import {
  createTicket,
  getTickets,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "@/services/apiServices/tickets.service";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        setError("");

        const data = await getTickets();

        setTickets(data);
      } catch (error) {

        setError(
          error instanceof Error ? error.message : "Failed to load tickets",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  async function handleCreateTicket(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      return;
    }

    try {
      setCreating(true);
      setError("");

      const newTicket = await createTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
      });

      setTickets((current) => [newTicket, ...current]);

      setTitle("");
      setDescription("");
      setPriority("medium");

      setShowCreateModal(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create ticket",
      );
    } finally {
      setCreating(false);
    }
  }

  //FILTER TICKETS

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,

      open: tickets.filter((ticket) => ticket.status === "open").length,

      inProgress: tickets.filter((ticket) => ticket.status === "in_progress")
        .length,

      resolved: tickets.filter((ticket) => ticket.status === "resolved").length,
    };
  }, [tickets]);

  if (loading) {
    return (
      <main className="p-6">
        <p>Loading tickets...</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      {/* HEADER */}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>

          <p className="text-gray-500">Manage your support tickets</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-black text-white"
        >
          Create Ticket
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-100 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 border rounded-xl">
          <p className="text-gray-500">Total</p>

          <h2 className="text-2xl font-bold">{stats.total}</h2>
        </div>

        <div className="p-5 border rounded-xl">
          <p className="text-gray-500">Open</p>

          <h2 className="text-2xl font-bold">{stats.open}</h2>
        </div>

        <div className="p-5 border rounded-xl">
          <p className="text-gray-500">In Progress</p>

          <h2 className="text-2xl font-bold">{stats.inProgress}</h2>
        </div>

        <div className="p-5 border rounded-xl">
          <p className="text-gray-500">Resolved</p>

          <h2 className="text-2xl font-bold">{stats.resolved}</h2>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 flex-1"
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as TicketStatus | "all")
          }
          className="border rounded-lg px-4 py-2"
        >
          <option value="all">All Status</option>

          <option value="open">Open</option>

          <option value="in_progress">In Progress</option>

          <option value="resolved">Resolved</option>

          <option value="closed">Closed</option>
        </select>
      </div>

      {/* TICKETS */}

      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center border rounded-xl">
            No tickets found.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div key={ticket._id} className="p-5 border rounded-xl">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    #{ticket._id.slice(-6)}
                  </p>

                  <h2 className="text-lg font-semibold">{ticket.title}</h2>

                  <p className="text-gray-600 mt-1">{ticket.description}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm">{ticket.status}</p>

                  <p className="text-sm text-gray-500">{ticket.priority}</p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Created {new Date(ticket.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-5">Create Ticket</h2>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <input
                type="text"
                placeholder="Ticket title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              />

              <textarea
                placeholder="Describe your issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
                rows={5}
              />

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="low">Low</option>

                <option value="medium">Medium</option>

                <option value="high">High</option>

                <option value="urgent">Urgent</option>
              </select>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
