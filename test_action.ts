import { getKanbanColumns } from './app/actions/kanban'

async function check() {
    const result = await getKanbanColumns()
    console.log('KANBAN COLUMNS RESULT:', JSON.stringify(result, null, 2))
}

check()
