
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import geopandas as gpd
import os

app = FastAPI(title="Smart City Infrastructure API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

DATA_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../data/processed/drainage_recommendations.geojson"
    )
)

@app.get("/")
def home():
    return {"message": "Smart City API is running!"}

@app.get("/drainage/recommendations")
def get_recommendations():

    if not os.path.exists(DATA_PATH):
        raise HTTPException(
            status_code=404,
            detail="Recommendation file not found"
        )

    data = gpd.read_file(DATA_PATH)

    return data.drop(
        columns="geometry"
    ).to_dict(orient="records")

@app.get("/drainage/recommendations/{grid_id}")
def get_recommendation(grid_id: int):

    data = gpd.read_file(DATA_PATH)

    result = data[data["grid_id"] == grid_id]

    if result.empty:
        raise HTTPException(
            status_code=404,
            detail="Grid ID not found"
        )

    return result.drop(
        columns="geometry"
    ).iloc[0].to_dict()
