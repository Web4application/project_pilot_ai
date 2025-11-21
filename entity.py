import json
from datetime import datetime
import psycopg2
from psycopg2.extras import Json

# ----------------------------
# SCTM Entity
# ----------------------------
class SCTMEntity:
    def __init__(self, name, entity_type="generic", parent=None):
        self.name = name
        self.type = entity_type
        self.parent = parent  # hierarchical parent
        self.timestamp = datetime.now().isoformat()
        self.attributes = {}  # domain-specific info
        self.emotions = {}    # optional emotions
        self.additional = {}  # extra structured data
        self.children = []    # sub-entities

    def add_attribute(self, key, value):
        self.attributes[key] = value

    def set_emotion(self, emotion_name, intensity):
        self.emotions[emotion_name] = intensity

    def add_additional(self, category, data):
        self.additional[category] = data

    def add_child(self, child_entity):
        self.children.append(child_entity)

    def to_dict(self):
        return {
            "name": self.name,
            "type": self.type,
            "parent": self.parent,
            "timestamp": self.timestamp,
            "attributes": self.attributes,
            "emotions": self.emotions,
            "additional": self.additional,
            "children": [c.to_dict() for c in self.children]
        }

# ----------------------------
# SCTM Manager
# ----------------------------
class SCTMManager:
    def __init__(self, db_config=None, json_file="sctm_universe.json"):
        self.entities = []
        self.json_file = json_file
        self.db_config = db_config

    def add_entity(self, entity: SCTMEntity):
        # update if exists
        for i, e in enumerate(self.entities):
            if e.name == entity.name and e.type == entity.type:
                self.entities[i] = entity
                return
        self.entities.append(entity)

    def save_to_json(self):
        all_data = [e.to_dict() for e in self.entities]
        with open(self.json_file, "w") as f:
            json.dump(all_data, f, indent=4)
        print(f"✅ SCTM universe saved to {self.json_file}")

    def load_from_json(self):
        try:
            with open(self.json_file, "r") as f:
                data = json.load(f)
            self.entities = []
            for e_dict in data:
                e = self._dict_to_entity(e_dict)
                self.entities.append(e)
            print(f"✅ SCTM universe loaded from {self.json_file}")
        except FileNotFoundError:
            print(f"⚠️ {self.json_file} not found. Starting fresh.")

    def _dict_to_entity(self, data):
        e = SCTMEntity(data["name"], data["type"], data.get("parent"))
        e.attributes = data.get("attributes", {})
        e.emotions = data.get("emotions", {})
        e.additional = data.get("additional", {})
        e.timestamp = data.get("timestamp", datetime.now().isoformat())
        for c in data.get("children", []):
            e.add_child(self._dict_to_entity(c))
        return e

    # ----------------------------
    # PostgreSQL Integration
    # ----------------------------
    def save_to_db(self):
        if not self.db_config:
            print("⚠️ No DB config provided. Skipping DB save.")
            return
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()
            # Create table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sctm_entities (
                    id SERIAL PRIMARY KEY,
                    name TEXT,
                    type TEXT,
                    parent TEXT,
                    data JSONB,
                    updated_at TIMESTAMP
                )
            """)
            for e in self.entities:
                self._upsert_entity(cursor, e)
            conn.commit()
            cursor.close()
            conn.close()
            print("✅ SCTM universe saved to PostgreSQL DB")
        except Exception as ex:
            print("❌ DB Error:", ex)

    def _upsert_entity(self, cursor, entity: SCTMEntity):
        cursor.execute("""
            INSERT INTO sctm_entities (name, type, parent, data, updated_at)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (name, type) DO UPDATE
            SET data = EXCLUDED.data,
                updated_at = EXCLUDED.updated_at
        """, (entity.name, entity.type, entity.parent, Json(entity.to_dict()), entity.timestamp))
        for child in entity.children:
            self._upsert_entity(cursor, child)

    # ----------------------------
    # Querying
    # ----------------------------
    def query_entities(self, entity_type=None, attribute_key=None, emotion=None):
        results = self.entities
        if entity_type:
            results = [e for e in results if e.type == entity_type]
        if attribute_key:
            results = [e for e in results if attribute_key in e.attributes]
        if emotion:
            results = [e for e in results if emotion in e.emotions]
        return results

# ----------------------------
# Example Config-Based Auto-Generation
# ----------------------------
def generate_sctm_from_config(config):
    manager = SCTMManager(db_config=config.get("db_config"))
    for domain in config.get("domains", []):
        entity = SCTMEntity(domain["name"], domain_type := domain.get("type", "generic"))
        for attr, val in domain.get("attributes", {}).items():
            entity.add_attribute(attr, val)
        for emo, intensity in domain.get("emotions", {}).items():
            entity.set_emotion(emo, intensity)
        for cat, data in domain.get("additional", {}).items():
            entity.add_additional(cat, data)
        # handle children
        for child_cfg in domain.get("children", []):
            child = SCTMEntity(child_cfg["name"], child_cfg.get("type", "generic"), parent=entity.name)
            for attr, val in child_cfg.get("attributes", {}).items():
                child.add_attribute(attr, val)
            entity.add_child(child)
        manager.add_entity(entity)
    return manager

# ----------------------------
# Example Usage
# ----------------------------
config = {
    "db_config": {
        "host": "localhost",
        "database": "sctm_db",
        "user": "your_user",
        "password": "your_password"
    },
    "domains": [
        {
            "name": "Alice",
            "type": "student",
            "attributes": {"Physics": {"confidence": 0.92, "tip": "Visualize planets"}},
            "emotions": {"curious": 0.8},
            "additional": {"biology": {"cell": "stem", "CRISPR": "P01"}},
            "children": []
        },
        {
            "name": "GravityExperiment",
            "type": "experiment",
            "attributes": {"setup": {"mass": "5kg", "height": "10m"}, "result": "9.8 m/s^2"},
            "children": []
        }
    ]
}

manager = generate_sctm_from_config(config)
manager.save_to_json()
manager.save_to_db()

# Query example
students = manager.query_entities(entity_type="student")
print(f"Students: {[e.name for e in students]}")
