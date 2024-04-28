import React, { useEffect, useState } from "react";
import ModelCard from "./ModelCard";
import { fetchAllDataFromTable, fetchModelDataById } from "../utils/modelsData";
import seedrandom from "seedrandom"; // an npm package to generate PRNG

const ModelOfTheDay = () => {
  const [model, setModel] = useState(null);
  const [allModels, setAllModels] = useState([]);

  useEffect(() => {
    // Load all models from the database
    fetchAllDataFromTable("modelsData")
      .then((models) => {
        setAllModels(models);

        // Filter the models with runs > 10000
        const eligibleModels = models.filter((model) => model.runs > 10000);

        // Sort the models by id for consistency
        eligibleModels.sort((a, b) => a.id - b.id);

        // Get current date and use it as a seed
        const now = new Date();
        const seed = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

        // Generate a pseudo-random number using the seed
        const rng = seedrandom(seed);
        const randomIndex = Math.floor(rng() * eligibleModels.length);

        // Pick the model of the day
        const modelOfTheDayId = eligibleModels[randomIndex].id;
        const modelOfTheDayPlatform = eligibleModels[randomIndex].platform;

        // Fetch the detailed data for the selected model
        fetchModelDataById(modelOfTheDayId, modelOfTheDayPlatform)
          .then((modelData) => {
            setModel(modelData);
          })
          .catch((error) => console.error("Error fetching model data:", error));
      })
      .catch((error) => console.error("Error loading models:", error));
  }, []);

  return <ModelCard model={model} allModels={allModels} />;
};

export default ModelOfTheDay;
