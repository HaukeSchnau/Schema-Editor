/* eslint-disable no-underscore-dangle */
import React from "react";
import { observer } from "mobx-react-lite";
import { ZodDefault, ZodEnum, ZodObjectDef, ZodSchema } from "zod";
import { availableGenerators, GeneratorId } from "../generator/Generators";

type ConfigOptionsProps = {
  id: GeneratorId;
  config: any;
};

const ConfigOptions: React.FC<ConfigOptionsProps> = ({ id, config }) => {
  const Generator = availableGenerators[id];
  const configSchema = Generator.configSchema as ZodSchema<any, ZodObjectDef>;

  const shape = configSchema._def.shape();

  return (
    <>
      {Object.entries(shape).map(([key, schema]) => {
        const unwrapped =
          schema instanceof ZodDefault ? schema._def.innerType : schema;

        return (
          // eslint-disable-next-line jsx-a11y/label-has-for
          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBlock: ".5rem",
              width: "100%",
            }}
          >
            {unwrapped.description}
            {unwrapped instanceof ZodEnum ? (
              <select
                value={config[key]}
                onChange={(e) => (config[key] = e.target.value)}
                style={{ margin: 0 }}
              >
                {unwrapped._def.values.map((value: string) => (
                  <option value={value}>{value}</option>
                ))}
              </select>
            ) : (
              <input
                className="highlighted ml-2"
                size={0}
                value={config[key]}
                onChange={(e) => (config[key] = e.target.value)}
              />
            )}
          </label>
        );
      })}
    </>
  );
};

export default observer(ConfigOptions);
