import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  return knex.schema.createTable('finances', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('user_id').notNullable();
    table.decimal('valor', 10, 2).notNullable();
    table.string('descricao').notNullable();
    table.boolean('is_deleted').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('finances');
}
