import { create } from "zustand";
import { pipelineStages, type Lead, type PipelineStageId } from "@/data/mock-data";
import { createLead as createLeadRecord, listLeads, stageToApi, updateLeadRecord } from "@/services/crm-api";

type CRMState = {
  leads: Lead[];
  selectedStage: PipelineStageId | "all";
  isLoading: boolean;
  isLoaded: boolean;
  loadLeads: () => Promise<void>;
  moveLead: (leadId: string, stage: PipelineStageId) => Promise<void>;
  addLead: (lead: Omit<Lead, "owner"> & { ownerId: string }) => Promise<Lead>;
  updateLead: (leadId: string, payload: Partial<Lead>) => Promise<Lead | null>;
  setSelectedStage: (stage: PipelineStageId | "all") => void;
};

export const useCrmStore = create<CRMState>((set, get) => ({
  leads: [],
  selectedStage: "all",
  isLoading: false,
  isLoaded: false,
  async loadLeads() {
    if (get().isLoading) {
      return;
    }

    set({ isLoading: true });

    try {
      const leads = await listLeads();
      set({ leads, isLoaded: true, isLoading: false });
    } catch (error) {
      console.error("Failed to load leads", error);
      set({ isLoading: false });
    }
  },
  async moveLead(leadId, stage) {
    const updated = await updateLeadRecord(leadId, { stage });
    set((state) => ({
      leads: state.leads.map((lead) => (lead.id === leadId ? updated : lead)),
    }));
  },
  async addLead(lead) {
    const created = await createLeadRecord({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      segment: lead.segment,
      origin: lead.origin,
      estimatedValue: lead.estimatedValue,
      setupValue: lead.setupValue,
      monthlyValue: lead.monthlyValue,
      priority: lead.priority,
      score: lead.score,
      ownerId: lead.ownerId,
      notes: lead.notes,
      tags: lead.tags,
      stage: lead.stage,
    });

    set((state) => ({
      leads: [created, ...state.leads],
    }));

    return created;
  },
  async updateLead(leadId, payload) {
    const updated = await updateLeadRecord(leadId, {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.company !== undefined ? { company: payload.company } : {}),
      ...(payload.email !== undefined ? { email: payload.email } : {}),
      ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
      ...(payload.segment !== undefined ? { segment: payload.segment } : {}),
      ...(payload.origin !== undefined ? { origin: payload.origin } : {}),
      ...(payload.estimatedValue !== undefined ? { estimatedValue: payload.estimatedValue } : {}),
      ...(payload.setupValue !== undefined ? { setupValue: payload.setupValue } : {}),
      ...(payload.monthlyValue !== undefined ? { monthlyValue: payload.monthlyValue } : {}),
      ...(payload.priority !== undefined ? { priority: payload.priority } : {}),
      ...(payload.score !== undefined ? { score: payload.score } : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
      ...(payload.tags !== undefined ? { tags: payload.tags } : {}),
      ...(payload.stage !== undefined ? { stage: payload.stage } : {}),
    });

    set((state) => ({
      leads: state.leads.map((lead) => (lead.id === leadId ? updated : lead)),
    }));

    return updated;
  },
  setSelectedStage(selectedStage) {
    set({ selectedStage });
  },
}));

export const pipelineStageMap = Object.fromEntries(
  pipelineStages.map((stage) => [stage.id, stage]),
) as Record<PipelineStageId, (typeof pipelineStages)[number]>;
