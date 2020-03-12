import * as React from 'react';
import { FC, FormEvent, useContext, useEffect, useState } from 'react';

import { Loader, Button, ContentBox, PageHeader } from '../../components';
import { PageContext } from '../../contexts';

import styles from './UploadRoute.scss';

export const UploadRoute: FC = () => {
  const { setPage } = useContext(PageContext);

  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [filesArray, setFilesArray] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('mmm');

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('uploadfile', file, file.name);

    const headers = new Headers();
    headers.delete('Content-Type');

    fetch('http://melapelan.in/upload.php', {
      method: 'post',
      headers,
      body: formData
    })
      .then(res => res.json())
      .then(json => {
        if (json) {
          setResponse(json.moved);
          setFilesArray(Object.values(json.files));
          setIsLoading(false);
        }
      })
      .catch(err => {
        setIsLoading(false);
        setResponse(err);
        console.log(err);
      });
  }

  function handleFile(e): void {
    setFile(e.target.files[0]);
  }

  function handleSelect(e): void {
    console.log(e.target.value);
    setFileType(e.target.value);
  }

  useEffect(() => {
    setPage('upload');
  }, []);

  return (
    <ContentBox>
      <PageHeader header="Document Uploader"></PageHeader>
      <form onSubmit={e => handleSubmit(e)} className={styles.form}>
        <select
          name="fileType"
          id="fileType"
          className={styles.select}
          onChange={e => handleSelect(e)}
        >
          <option value="">- Choose file type -</option>
          <option value="image">image</option>
          <option value="document">document</option>
          <option value="pdf">pdf</option>
        </select>
        <input
          type="file"
          name="upload-file"
          id="upload-file"
          className={styles.fileInput}
          onChange={e => handleFile(e)}
        />
        <Button
          type="submit"
          disabled={!file || !fileType}
          styleOverride={styles.button}
        >
          Upload File
        </Button>
      </form>

      {isLoading ? (
        <Loader />
      ) : (
        filesArray && (
          <div className={styles.response}>
            {response}
            <div>
              <h3>Files on server:</h3>
              {filesArray.map(file => (
                <p key={file}>{file}</p>
              ))}
            </div>
          </div>
        )
      )}
    </ContentBox>
  );
};
