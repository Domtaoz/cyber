import socket
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schema import schema
from strawberry.fastapi import GraphQLRouter
from config import Config

def get_local_ip() -> str:
    try:
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        return local_ip
    except Exception:
        return "127.0.0.1"

app = FastAPI(title="Mookrata API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

def run():
    server_config = Config.load_server_config()
    host_ip = get_local_ip()
    
    print(f"🚀 Starting server on http://{host_ip}:{server_config['port']}/graphql")
    
    uvicorn.run("main:app", host=host_ip, port=int(server_config["port"]), reload=True)

if __name__ == "__main__":
    run()