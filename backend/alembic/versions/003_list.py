"""list

Revision ID: 003
Revises: 002
Create Date: 2026-04-01

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'lists',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('position', sa.Float(), nullable=False),
        sa.Column('board_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['board_id'], ['boards.id'], ),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True
    )
    op.create_index(op.f('ix_lists_id'), 'lists', ['id'], unique=False,if_not_exists=True)

def downgrade() -> None:
    op.drop_index(op.f('ix_lists_id'), table_name='lists',if_exists=True)
    op.drop_table('lists',if_exists=True)
