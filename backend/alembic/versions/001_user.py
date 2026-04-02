"""user

Revision ID: 001
Revises: 
Create Date: 2026-04-01

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('email', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('hashed_password', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True,if_not_exists=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False,if_not_exists=True)

def downgrade() -> None:
    op.drop_index(op.f('ix_users_id'), table_name='users',if_exists=True)
    op.drop_index(op.f('ix_users_email'), table_name='users',if_exists=True)
    op.drop_table('users',if_exists=True)
