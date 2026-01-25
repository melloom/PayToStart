import type { Contract } from "@/lib/types";
import { generateContractHash } from "@/lib/signature";

/**
 * Generate hash of contract content for integrity verification
 * Takes a Contract object and hashes its content
 */
export function hashContractContent(contract: Contract): string {
  // Hash the contract content to ensure integrity
  return generateContractHash(contract.content);
}
