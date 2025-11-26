// src/app/api/get_task/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = 'http://backend:8000';
  console.log(`Tentative de connexion à : ${apiUrl}/get_task`);

  try {
    const response = await fetch(`${apiUrl}/get_task?archived=false`, {
      next: { revalidate: 0 },  // Désactive le cache
    });
    console.log("Statut de la réponse:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur du backend:", errorText);
      return NextResponse.json([], { status: 500 });
    }

    const data = await response.json();
    console.log("Données reçues:", data);  // Affiche les données brutes
    return NextResponse.json(data);
  } catch (error) {
    console.error("Échec de la requête:", error);
    return NextResponse.json([], { status: 500 });
  }
}
