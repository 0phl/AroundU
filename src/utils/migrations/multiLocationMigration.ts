import { db } from '../../lib/firebase';
import { collection, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { Business } from '../../types';

export async function migrateToMultipleLocations() {
  try {
    console.log('Starting migration to multiple locations...');
    const businessesRef = collection(db, 'businesses');
    const snapshot = await getDocs(businessesRef);
    
    let migrated = 0;
    let failed = 0;

    for (const doc of snapshot.docs) {
      try {
        const business = doc.data() as Business & {
          // Old fields that will be migrated
          address?: string;
          coordinates?: { lat: number; lng: number };
          phone?: string;
          email?: string;
        };

        // Skip if already migrated
        if (business.locations) {
          console.log(`Business ${doc.id} already migrated, skipping...`);
          continue;
        }

        // Create locations array with the main location
        const locations = [{
          id: crypto.randomUUID(),
          name: 'Main Branch',
          address: business.address || '',
          coordinates: business.coordinates || {
            lat: 14.458942866502959,
            lng: 120.96075553643246
          },
          phone: business.phone,
          email: business.email
        }];

        // Update the document
        await updateDoc(doc.ref, {
          locations,
          // Remove old fields
          address: null,
          coordinates: null,
          phone: null,
          email: null
        });

        migrated++;
        console.log(`Successfully migrated business: ${business.name}`);
      } catch (error) {
        failed++;
        console.error(`Failed to migrate business ${doc.id}:`, error);
      }
    }

    console.log(`Migration completed. Migrated: ${migrated}, Failed: ${failed}`);
    return { migrated, failed };
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
} 