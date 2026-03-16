import { useCallback, useEffect, useState } from "react";
import {
  getAttachments,
  getCustomer,
  getOperator,
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
  status: "",
  identity: ""
};

const initialSchedule = {
  data: "",
  hora: "",
  canal: "",
  responsavel: ""
};

export function useAppData(identity, preloadedContact) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [protocol, setProtocol] = useState("");
  const [crmLabel, setCrmLabel] = useState("Integração lateral do CRM");
  const [customer, setCustomer] = useState(initialCustomer);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [attachments, setAttachments] = useState([]);
  const [operatorEmail, setOperatorEmail] = useState("");
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    if (!identity && !preloadedContact?.cpf) {
      setCustomer(initialCustomer);
      setSchedule(initialSchedule);
      setAttachments([]);
      setProtocol("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [protocolData, customerData, scheduleData, attachmentsData, operatorData] =
        await Promise.all([
          getProtocol(identity),
          identity ? getCustomer(identity) : Promise.resolve(preloadedContact || {}),
          getSchedule(identity),
          getAttachments(identity),
          getOperator()
        ]);

      const mergedCustomer = {
        ...initialCustomer,
        ...(customerData || {}),
        ...(preloadedContact || {}),
        identity:
          preloadedContact?.identity ||
          customerData?.identity ||
          identity ||
          ""
      };

      setProtocol(protocolData?.protocol || "");
      setCrmLabel(protocolData?.crmLabel || "Integração lateral do CRM");
      setCustomer(mergedCustomer);
      setSchedule(scheduleData || initialSchedule);
      setAttachments(Array.isArray(attachmentsData) ? attachmentsData : []);
      setOperatorEmail(operatorData?.email || preloadedContact?.emailOperador || "");
    } catch (err) {
      setError(err?.message || "Falha ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [identity, preloadedContact]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleUpload = useCallback(async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      const newItem = await uploadAttachment(file, identity);
      setAttachments((current) => [newItem, ...current]);
    } catch (err) {
      setError(err?.message || "Falha ao enviar arquivo");
    } finally {
      setUploading(false);
    }
  }, [identity]);

  return {
    loading,
    uploading,
    protocol,
    crmLabel,
    customer,
    schedule,
    attachments,
    operatorEmail,
    error,
    reload: loadAll,
    upload: handleUpload
  };
}
