import { NextResponse } from "next/server"
import { supabase } from "@/utils/supabase/client"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar dados
    if (
      !body.client_id ||
      !body.professional_id ||
      !body.service_id ||
      !body.date ||
      !body.start_time ||
      !body.end_time
    ) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 }
      )
    }

    // Criar o objeto de agendamento
    const appointmentData = {
      client_id: body.client_id,
      professional_id: body.professional_id,
      service_id: body.service_id,
      date: body.date,
      start_time: body.start_time,
      end_time: body.end_time,
      status: "scheduled",
      notes: body.notes || null,
    }

    console.log("Inserindo agendamento via API:", appointmentData)

    // Inserir o agendamento diretamente
    const { data, error } = await supabase
      .from("appointments")
      .insert(appointmentData)
      .select("id")
      .single()

    if (error) {
      console.error("Erro ao inserir agendamento via API:", error)

      // Se for um erro de restrição única
      if (
        error.code === "23505" ||
        (error.message && error.message.includes("unique constraint"))
      ) {
        return NextResponse.json(
          { error: "Já existe um agendamento para este horário" },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: "Erro ao criar agendamento", details: error },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Agendamento criado com sucesso",
        data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro na API de agendamentos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
