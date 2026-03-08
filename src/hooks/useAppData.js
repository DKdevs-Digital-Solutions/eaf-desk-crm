import { useCallback, useEffect, useState } from "react";
import {
  getAttachments,
  getCustomer,
  getProtocol,
  getSchedule,
  uploadAttachment
} from "../services/api";

const initialCustomer = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  produto: "",
  status: ""
};

const initialSchedule = {
  data: "",
  hora: "",
  canal: "",
  responsavel: ""
};

export function useAppData() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [protocol, setProtocol] = useState("");
  const [crmLabel, setCrmLabel] = useState("Integração lateral do CRM");
  const [customer, setCustomer] = useState(initialCustomer);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [protocolData, customerData, scheduleData, attachmentsData] =
        await Promise.all([
          getProtocol(),
          getCustomer(),
          getSchedule(),
          getAttachments()
        ]);

      setProtocol(protocolData?.protocol || "");
      setCrmLabel(protocolData?.crmLabel || "Integração lateral do CRM");
      setCustomer(customerData || initialCustomer);
      setSchedule(scheduleData || initialSchedule);
      setAttachments(Array.isArray(attachmentsData) ? attachmentsData : []);
    } catch (err) {
      setError(err?.message || "Falha ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleUpload = useCallback(async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      const newItem = await uploadAttachment(file);
      setAttachments((current) => [newItem, ...current]);
    } catch (err) {
      setError(err?.message || "Falha ao enviar arquivo");
    } finally {
      setUploading(false);
    }
  }, []);

  return {
    loading,
    uploading,
    protocol,
    crmLabel,
    customer,
    schedule,
    attachments,
    error,
    reload: loadAll,
    upload: handleUpload
  };
}
