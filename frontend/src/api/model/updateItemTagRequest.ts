/**
 * Generated by orval v6.11.0 🍺
 * Do not edit manually.
 * QrTagger
 * OpenAPI spec version: v1
 */
import type { ItemTagFieldGroup } from './itemTagFieldGroup';

export interface UpdateItemTagRequest {
  name: string;
  description: string;
  fieldGroups: ItemTagFieldGroup[];
}