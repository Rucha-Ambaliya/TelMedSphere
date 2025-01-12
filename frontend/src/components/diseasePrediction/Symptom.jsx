import React, { Component } from "react";
import { Diseases } from "../../data/diseases";
import { Symptoms } from "../../data/symptoms";

class Symptom extends Component {
  state = {
    gender: this.props.gender,
    age: this.props.age,
    user_symptoms: this.props.userSymptoms,
    disease_with_possibility: this.props.diseasePossibility,
    dropdown_style: "dropdown-menu-on",
    searched: "",
  };

  disease_symptoms = Diseases;


  addSymptomButtonEvent = (e) => {
    if (!this.state.user_symptoms.includes(e.target.value)) {
      let user_symptoms = [e.target.value, ...this.state.user_symptoms];
      return this.setState({ user_symptoms: user_symptoms, searched: "" }, () => {
        this.get_possible_disease();
      });
    }
  };
  

  deleteSymptomButtonEvent = (e) => {
    if (this.state.user_symptoms.includes(e.target.value)) {
      let user_symptoms = [...this.state.user_symptoms];
      user_symptoms = user_symptoms.filter((s) => s !== e.target.value);
      this.setState({ user_symptoms: user_symptoms }, () => {
        this.get_possible_disease();
      });
    }
  };

  
  get_possible_disease = () => {
    let possible_disease_function = (arr1, arr2) => {
      let empty_array = [];
      for (let i = 0; i < arr1.length; i++) {
        for (let n = 0; n < arr2.length; n++) {
          if (arr1[i] === arr2[n]) {
            empty_array = [...empty_array, arr1[i]];
          }
        }
      }
      return empty_array;
    };
    let all_objects = [];
    Object.keys(this.disease_symptoms).map((key) => {
      let array1 = [...this.disease_symptoms[key]];
      let array2 = [...this.state.user_symptoms];
      let empty_array = possible_disease_function(array1, array2);
      let possbility = ((empty_array.length / array1.length) * 100).toFixed(2);
      let object = {
        name: key,
        possibility: possbility,
        disease_symptom: this.disease_symptoms[key],
        symptom_user_has: empty_array,
      };
      return (all_objects = [...all_objects, object]);
    });
    
    localStorage.setItem("previousTest", JSON.stringify(all_objects.length > 0? all_objects[0] : []));
    return this.setState({ disease_with_possibility: all_objects.length < 5? all_objects : all_objects.slice(0,5) }, () => {
      this.props.getPossibleDisease(this.state.disease_with_possibility, this.state.user_symptoms);
    });
  };

  
  
  getInputSymptoms = (e) => {
    return this.setState({ searched: e.target.value });
  };


  on_click_reset_button = () => {
    return this.setState(
      {
        user_symptoms: [],
        disease_with_possibility: [],
      },
      () => {
        return this.get_possible_disease();
      }
    );
  };

  keyDownEvent = (e) => {
    const re = new RegExp(e.target.value.split("").join("\\w*").replace(/\W/, ""), "i");

    const symps = Symptoms.filter((each) => {
      return each.match(re);
    });
    if (e.key === "Enter") {
      // eslint-disable-next-line array-callback-return
      return symps.map((key) => {
        if (!this.state.user_symptoms.includes(key) && e.target.value.toLowerCase() === key.toLowerCase()) {
          return this.setState(
            {
              user_symptoms: [...this.state.user_symptoms, key],
            },
            () => {
              return this.get_possible_disease();
            }
          );
        } else if (!this.state.user_symptoms.includes(e.target.value)) {
          for (let i = 0; i < symps.length; i++) {
            if (!this.state.user_symptoms.includes(symps[i])) {
              this.setState(
                {
                  user_symptoms: [...this.state.user_symptoms, symps[i]],
                },
                () => {
                  return this.get_possible_disease();
                }
              );
              break;
            }
          }
        }
      });
    }
  };

  showContent = () => {
    // eslint-disable-next-line default-case
    const symps = Symptoms.filter((each) => {
      return each.toLowerCase().includes(this.state.searched.toLowerCase());
    });
    
    return (
      // Symptoms
      <div id="" className=" leading-9 pt-8">
        <div className="grid grid-cols-7">
            <div className="col-span-3 max-md:col-span-full relative">
              {/* searchSymptomsInput */}
            <input
                className="border-0 outline-none usa-input border-b-[1px] border-b-blue-6 transition-colors duration-200 ease-in-out box-border p-2 text-blue-7 w-[95%]  focus:border-b-blue-6 focus:border-b-[2px] focus:transition-colors focus:duration-200 focus:ease-in-out"
                onKeyDown={this.keyDownEvent}
                onChange={this.getInputSymptoms}
                value={this.state.searched}
                placeholder="Search Symptoms"
                id="input-type-text"
                name="input-type-text"
                type="text"
            />
            
            {/* symtomsListBox */}
            <ul className="w-full h-[35vh] overflow-y-scroll text-grey-3 list-none leading-9 pt-2 pl-0">
                {symps
                .filter((item) => !this.state.user_symptoms.includes(item))
                .map((key, id) => {
                    return (
                    <li key={id} className="px-0 transition-all ease-in-out duration-200 rounded-[5px] my-0">
                        <button onClick={this.addSymptomButtonEvent.bind(this)} value={key} className="px-4 my-0 py-1 hover:bg-blue-1 hover:cursor-pointer transition-all ease-in-out duration-200 hover:text-blue-9 border-0 w-full h-full text-left text-base focus:outline-none">
                        {key}
                        </button>
                    </li>
                    );
                })}
            </ul>
            
            </div>
            {/* second-grid UserSymptoms*/}
            <div className="col-span-4 max-md:col-span-full">
            <ul className="list-none p-4">
                {this.state.user_symptoms.map((key, id) => (
                <li key={id} className="bg-blue-9 text-white-1 py-2 px-2 rounded-xl text-[1rem] m-[5px] inline-block">
                    {key}{" "}
                    <button onClick={this.deleteSymptomButtonEvent.bind(this)} key={id} value={key} className="inline-flex items-center justify-center text-center align-middle border-none w-6 h-7 bg-white-1 text-blue-9 rounded-xl text-[0.8rem] font-semibold px-[0.2rem] py-[0.5rem] transition-all duration-200 ease hover:cursor-pointer hover:bg-blue-1 hover:transition-all hover:duration-300 hover:ease-in-out">
                    X
                    </button>
                </li>
                ))}
            </ul>
            </div>
        </div>
        <div className="flex justify-center items-center">
          <button onClick={this.on_click_reset_button} className="border-none outline-none bg-blue-3 border-[1px] border-blue-5 text-white-1 rounded-[5px] mx-[8px] my-[5px] font-sans transition-all duration-300 ease-in-out hover:bg-blue-5 active:bg-blue-5 disabled:bg-blue-5 disabled:cursor-not-allowed h-auto w-auto usa-button--secondary px-[10px] py-[7px] ">
            Reset
          </button>
        </div>
      </div>
    );
  };

  render() {
    return <>{this.showContent()}</>;
  }
}

export default Symptom;