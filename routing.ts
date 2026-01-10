
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { familyId } = await req.json();

    if (!familyId) {
      return NextResponse.json({ error: 'Missing familyId' }, { status: 400 });
    }

    // In a real app, you would add server-side authentication here to verify
    // that the user making the request has permission to finalize this family.
    // For example:
    // const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    // const decoded = await getAuth().verifyIdToken(token);
    // if (!decoded.uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const familyRef = db.collection('familyCores').doc(familyId);
    const snapshot = await familyRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    const family = snapshot.data();

    if (family.isFinalized) {
      return NextResponse.json({ error: 'This family universe has already been finalized.' }, { status: 409 });
    }

    // ✅ HARD VALIDATION (non-negotiable server-side check)
    const members = Object.values(family.members || {});
    const parents = members.filter((m: any) => m.type === 'parent' && m.name && m.name !== 'Awaiting User...' && m.dob);
    
    if (parents.length < 1) {
      return NextResponse.json(
        { error: 'Cannot finalize: At least one adult must be fully registered with a name and date of birth.' },
        { status: 422 } // Unprocessable Entity
      );
    }

    // 🔒 Lock all member profiles
    const lockedMembers = {};
    for (const m of members) {
      const memberData = m as any;
      if (memberData.name && memberData.name !== 'Awaiting User...') {
          lockedMembers[memberData.id] = {
            ...memberData,
            archetypeLocked: true,
            isComplete: true
          };
      } else {
         lockedMembers[memberData.id] = memberData;
      }
    }

    await familyRef.update({
      members: lockedMembers,
      isFinalized: true,
      finalizedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: (family.version || 1) + 1
    });

    return NextResponse.json({ success: true, message: 'Family universe finalized and locked.' });

  } catch (err) {
    console.error("Finalization API Error:", err);
    return NextResponse.json({ error: 'An unexpected server error occurred during finalization.' }, { status: 500 });
  }
}

    
