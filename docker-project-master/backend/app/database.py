from sqlalchemy import create_engine, inspect, MetaData
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

import os
from typing import Generator, List, Type, Any


DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://todouser:strongpassword@postgres:5432/tododb")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def create_tables_if_not_exist(models: List[Any]) -> None:
    """
    Create database tables only if they do not already exist.
    Handles table dependencies by creating tables in the correct order.
    
    Args:
        models: List of SQLAlchemy model classes to create tables for
    """
    inspector = inspect(engine)
    metadata = MetaData()
    
    # Create a dictionary of model classes keyed by table name
    model_dict = {model.__tablename__: model for model in models}
    
    # Create a set to track created tables
    created_tables = set()
    
    def get_table_dependencies(model_class: Type[Any]) -> List[str]:
        """
        Get the list of table names that this model depends on (foreign keys).
        
        Args:
            model_class: The SQLAlchemy model class to analyze
            
        Returns:
            List of table names that this model depends on
        """
        dependencies = []
        for column in model_class.__table__.columns:
            for foreign_key in column.foreign_keys:
                dependencies.append(foreign_key.target_fullname.split('.')[0])
        return dependencies

    def create_table_and_dependencies(table_name: str) -> None:
        """
        Recursively create a table and its dependencies.
        
        Args:
            table_name: Name of the table to create
        """
        if table_name in created_tables:
            return
            
        model_class = model_dict.get(table_name)
        if not model_class:
            return
            
        # Get dependencies for this table
        dependencies = get_table_dependencies(model_class)
        
        # Create dependencies first
        for dep_table in dependencies:
            if dep_table not in created_tables:
                create_table_and_dependencies(dep_table)
        
        # Create the table if it doesn't exist
        if not inspector.has_table(table_name):
            try:
                model_class.__table__.create(engine)
                print(f"Created table: {table_name}")
            except Exception as e:
                print(f"Error creating table {table_name}: {e}")
                raise
        
        created_tables.add(table_name)
    
    # Create all tables in the correct order
    for model in models:
        create_table_and_dependencies(model.__tablename__)