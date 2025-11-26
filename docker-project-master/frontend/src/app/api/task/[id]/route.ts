// src/app/api/task/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
  
  try {
    // 1. Vérification de l'ID
    if (!params.id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // 2. Validation du corps de la requête
    const body = await req.json();
    console.log('Update payload:', body); // Log pour débogage

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'Update data is required' },
        { status: 400 }
      );
    }

    // 3. Appel au backend
    const response = await fetch(`${apiUrl}/task/${params.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        // Ajoutez d'autres headers si nécessaire (auth, etc.)
      },
      body: JSON.stringify(body),
    });

    // 4. Gestion des erreurs du backend
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', errorData);
      return NextResponse.json(
        { error: 'Backend update failed', details: errorData },
        { status: response.status }
      );
    }

    // 5. Retour des données mises à jour
    const updatedTask = await response.json();
    return NextResponse.json(updatedTask);

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
  try {
    const response = await fetch(`${apiUrl}/task/${params.id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      return NextResponse.json({ error: 'Could not delete task' }, { status: response.status });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch  {
    return NextResponse.json({ error: 'Could not delete task' }, { status: 500 });
  }
}
