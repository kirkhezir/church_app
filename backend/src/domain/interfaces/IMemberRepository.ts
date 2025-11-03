import { Member } from '../entities/Member';

/**
 * Repository interface for Member entity
 * Follows dependency inversion principle - domain defines interface, infrastructure implements
 */
export interface IMemberRepository {
  /**
   * Find member by ID
   */
  findById(id: string): Promise<Member | null>;

  /**
   * Find member by email
   */
  findByEmail(email: string): Promise<Member | null>;

  /**
   * Find all members (excluding deleted)
   */
  findAll(): Promise<Member[]>;

  /**
   * Find members by role
   */
  findByRole(role: string): Promise<Member[]>;

  /**
   * Search members by name
   */
  searchByName(query: string): Promise<Member[]>;

  /**
   * Create new member
   */
  create(member: Member): Promise<Member>;

  /**
   * Update existing member
   */
  update(member: Member): Promise<Member>;

  /**
   * Delete member (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Count total members
   */
  count(): Promise<number>;
}
