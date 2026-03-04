import React, {
  useState,
  useRef,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { makeStyles } from "@mui/styles";
import { Button, Grid, useMediaQuery, useTheme } from "@mui/material";
import emailjs from "@emailjs/browser";
import { SnackbarProvider, useSnackbar } from "notistack";

/* ---------------- Styles ---------------- */
const useStyles = makeStyles((theme: any) => ({
  reviewInput: {
    background: theme?.palette?.primary?.main || "#fff",
    minHeight: "68px",
    padding: "0 20px",
    border: "none",
    borderRadius: "4px",
    outline: "none",
    fontSize: "20px",
    width: "100%",
    // flex:1,
    "&::placeholder": {
      color: "text.secondary",
      fontSize: "16px",
    },
  },
  reviewTextArea: {
    background: theme?.palette?.primary?.main || "#fff",
    padding: "30px 20px",
    border: "none",
    borderRadius: "4px",
    outline: "none",
    fontSize: "20px",
    "&::placeholder": {
      color: "text.secondary",
      fontSize: "16px",
      fontFamily: "poppins",
    },
    display: "block",
    resize: "vertical",
  },
}));

/* ---------------- Types ---------------- */
export interface Field {
  type: string;
  name: string;
  required: boolean;
  placeholder: string;
}

export interface FormCProps {
  fields: Field[];
  buttonText: string;
  textAreaPlaceholder: string;
  onSubmit?: (formData: Record<string, string>) => Promise<void> | void;
}

const FormC: React.FC<FormCProps> = ({
  fields,
  buttonText,
  textAreaPlaceholder,
  onSubmit,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const [buttonTextState, setButtonTextState] = useState(buttonText);
  const formRef = useRef<HTMLFormElement>(null);
  const isSmUp = useMediaQuery(theme.breakpoints.up("md"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("lg"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("xl"));
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [textareaValue, setTextareaValue] = useState("");

  const initialFormState: Record<string, string> = fields.reduce(
    (acc, field) => {
      acc[field.name] = "";
      return acc;
    },
    {} as Record<string, string>,
  );

  const [formData, setFormData] =
    useState<Record<string, string>>(initialFormState);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "message") {
      setTextareaValue(value);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setButtonTextState("Sending...");

    try {
      if (onSubmit) {
        await onSubmit({ ...formData, message: textareaValue });

        enqueueSnackbar("Form submitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
          action: (key) => (
            <Button
              color="inherit"
              size="small"
              onClick={() => closeSnackbar(key)}
            >
              Close
            </Button>
          ),
        });
      } else {
        const public_key = import.meta.env.REACT_APP_EMAILJS_USER as string;
        const service_id = import.meta.env
          .REACT_APP_EMAILJS_SERVICE_ID as string;
        const template_id = import.meta.env
          .REACT_APP_EMAILJS_TEMPLATE_ID as string;

        await emailjs.sendForm(
          service_id,
          template_id,
          formRef.current as HTMLFormElement,
          public_key,
        );

        enqueueSnackbar("Form submitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
          action: (key) => (
            <Button
              color="inherit"
              size="small"
              onClick={() => closeSnackbar(key)}
            >
              Close
            </Button>
          ),
        });
      }

      setFormData(initialFormState);
      setTextareaValue("");
      setButtonTextState(buttonText);
    } catch (error: any) {
      enqueueSnackbar(error?.text || "An error occurred", {
        variant: "error",
        autoHideDuration: 2000,
        action: (key) => (
          <Button
            color="inherit"
            size="small"
            onClick={() => closeSnackbar(key)}
          >
            Close
          </Button>
        ),
      });
      setButtonTextState(buttonText);
    }
  };

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        style={{ maxWidth: 800, display: "block" }}
      >
        <Grid
          container
          spacing={2}
          xs={12}
          md={6}
          sx={{ mb: 2, width: "100%" }}
          justifyContent="space-between"
          alignItems="flex-start"
          component="div"
          {...({} as any)}
        >
          {" "}
          {fields.map((field, index) => {
            let mdCols = 12;
            if (fields.length === 2) {
              mdCols = 6;
            } else if (fields.length === 3) {
              mdCols = index < 2 ? 6 : 12;
            }

            return (
              <Grid
                item
                key={index}
                xs={12}
                md={mdCols}
                sx={{ pr: 0, pl: 0, flex: 1 }}
                component="div"
                {...({} as any)}
              >
                <input
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  placeholder={field.placeholder}
                  className={classes.reviewInput}
                  value={formData[field.name]}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    margin: 0,
                  }}
                />
              </Grid>
            );
          })}
        </Grid>

        <textarea
          rows={6}
          name="message"
          placeholder={textAreaPlaceholder}
          className={classes.reviewTextArea}
          style={{
            width: "100%",
            marginBottom: "16px",
          }}
          value={textareaValue}
          onChange={handleChange}
        ></textarea>

        <Button
          type="submit"
          sx={{
            background: (theme.palette.primary as any).focus,
            color: theme.palette.common.white,
            height: "64px",
            px: 4,
            borderRadius: 2,
            mt: 3,
            "&:hover": {
              background: (theme.palette.primary as any).focus,
              opacity: 0.9,
            },
          }}
        >
          {buttonTextState}
        </Button>
      </form>
    </>
  );
};

/* ---------------- Wrapper with Snackbar ---------------- */
const EnhancedForm: React.FC<FormCProps> = (props) => (
  <SnackbarProvider
    maxSnack={3}
    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    autoHideDuration={2000}
  >
    <FormC {...props} />
  </SnackbarProvider>
);

export default EnhancedForm;
