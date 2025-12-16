import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../src/firebase";

/**
 * 👀 Listen to agent location
 */
export const listenToAgentLocation = (agentId, callback) => {
  return onSnapshot(doc(db, "agent_locations", agentId), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  });
};
