import React, { useEffect, useState } from "react";
import { JobcardProps } from "../../utils/types";
import axios from "axios";

function JobpostCard({
  _id,
  title,
  company,
  location,
  salary,
  jobtype,
  createdAt,
}: JobcardProps): React.ReactElement {
  const [appl, setappl] = useState<number>(0);
  const token = localStorage.getItem("token");
  const getApplicants = async () => {
    try {
      let response = await axios.get(
        `http://127.0.0.1:5000/api/application/${_id}/getApplicants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setappl(response.data.applications.length);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getApplicants();
  }, []);

  return (
    <div className="bg-white w-[30%] rounded-lg p-1">
      <h2 className="text-xl font-semibold text-gray-800">
        {jobtype} {title}
      </h2>
      <p className="text-sm text-gray-600">
        {company}-{location}
      </p>
      <span className="text-sm text-gray-600">{salary} lpa</span>

      <div className="text-sm text-gray-600">
        Posted on: {new Date(createdAt as Date).toLocaleString()}
      </div>
      <div>Total Applications: {appl}</div>
    </div>
  );
}

export default JobpostCard;
