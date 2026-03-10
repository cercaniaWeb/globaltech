import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables desde .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos en .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrarClientes() {
    const filePath = path.join(process.cwd(), 'clientes.txt');

    if (!fs.existsSync(filePath)) {
        console.error('Error: El archivo clientes.txt no existe en la raíz del proyecto.');
        return;
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const lineas = data.split('\n');

    console.log(`🚀 Iniciando migración de ${lineas.filter(l => l.trim()).length} clientes...`);

    for (const linea of lineas) {
        if (!linea.trim()) continue;

        // Dividimos por tabuladores o espacios múltiples
        const partes = linea.split(/\t+/);

        const nombre = partes[0]?.trim();
        const usuario = partes[1]?.trim() || 'admin';
        const password = partes[2]?.trim() || 'root@GTD';
        const email = partes[3]?.trim() || null;

        console.log(`  🔍 Procesando: ${nombre}...`);

        const { error } = await supabase
            .from('clientes_cctv')
            .insert([
                {
                    nombre_cliente: nombre,
                    usuario_dvr: usuario,
                    pass_dvr: password,
                    email_notificaciones: email,
                    status_actual: 'Pendiente de Vinculación'
                }
            ]);

        if (error) {
            console.error(`  ❌ Error en ${nombre}:`, error.message);
        } else {
            console.log(`  ✅ ${nombre} migrado exitosamente.`);
        }
    }

    console.log('\n🏁 Migración completada.');
}

migrarClientes();
